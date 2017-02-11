import React, { Component, PropTypes} from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, Translation } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";

import renderWidthHeightList, {
  WIDTH_HEIGHT_VARIANT_TYPE,
  width_heightVariantUploadForm,
} from "/imports/plugins/custom/width-height-variant/client/render-list";
class VariantList extends Component {

  handleVariantEditClick = (event, editButtonProps) => {
    if (this.props.onEditVariant) {
      return this.props.onEditVariant(event, editButtonProps.data);
    }
    return true;
  }

  handleVariantVisibilityClick = (event, editButtonProps) => {
    if (this.props.onVariantVisibiltyToggle) {
      const isVariantVisible = !editButtonProps.data.isVisible;
      this.props.onVariantVisibiltyToggle(event, editButtonProps.data, isVariantVisible);
    }
  }

  handleChildleVariantClick = (event, variant) => {
    if (this.props.onVariantClick) {
      this.props.onVariantClick(event, variant, 1);
    }
  }

  handleChildVariantEditClick = (event, editButtonProps) => {
    if (this.props.onEditVariant) {
      return this.props.onEditVariant(event, editButtonProps.data, 1);
    }
    return true;
  }

  isSoldOut(variant) {
    if (this.props.isSoldOut) {
      return this.props.isSoldOut(variant);
    }

    return false;
  }

  renderVariants() {
    if (!this.props.variants) {
      return (
        <li>
          <a href="#" id="create-variant">
            {"+"} <Translation defaultValue="Create Variant" i18nKey="variantList.createVariant" />
          </a>
        </li>
      );
    }
    var variants = this.props.variants;
    var offset = this.state && this.state.offset || 0;
    var toRender = variants.length > 10 ? variants.slice(offset, 10) : variants;
    return (
      offset === 0 ? [] : [
        <li key="prev-button">
          <button onClick={(e)=>{
              e.preventDefault();
              this.setState({ offset : offset - 10 });
          }}>Previous Variants</button>
        </li>
      ]
    ).concat(toRender.map((variant, index) => {
      const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);

      return (
        <EditContainer
          data={variant}
          disabled={this.props.editable === false}
          editView="variantForm"
          i18nKeyLabel="productDetailEdit.editVariant"
          key={index}
          label="Edit Variant"
          onEditButtonClick={this.handleVariantEditClick}
          onVisibilityButtonClick={this.handleVariantVisibilityClick}
          permissions={["createProduct"]}
          showsVisibilityButton={true}
        >
          <Variant
            displayPrice={displayPrice}
            editable={this.props.editable}
            index={index}
            isSelected={this.props.variantIsSelected(variant._id)}
            onClick={this.props.onVariantClick}
            onMove={this.props.onMoveVariant}
            soldOut={this.isSoldOut(variant)}
            variant={variant}
          />
        </EditContainer>
      );
    })).concat(
      offset + 10 >= variants.length ? [] : [
        <li key="next-button">
          <button onClick={(e)=>{
            e.preventDefault();
            this.setState({ offset : offset + 10 });
          }}>Next Variants</button>
        </li>
      ]
    );
  }

  renderChildVariants() {
    if (!this.props.childVariants) {
      return null;
    }
    const lists = this.props.childVariants.reduce((variants, childVariant, index) => {
      const type = childVariant.variantType || "variant";
      if(!(type in variants)) {
        variants[type] = [];
      }
      variants[type].push(childVariant);

      return variants;
    }, {});
    var methods = this;
    var props = this.props;
    return Object.keys(lists).map(function(type){
      const list = lists[type];
      return (<div key={"".concat("rendered-list", "-", type)}>
        {renderList(type, list, props, methods)}
      </div>)
    });
    // var list = this.props.childVariants.filter(function(variant) {
    //   return !!variant.width && !!variant.height;
    // })
    // return renderWidthHeightList(list, this.props, this.methods);
  }

  render() {
    return (
      <div className="product-variants">{[
        !Reaction.hasPermission("createProduct") ? null : <Divider
          key="upload-width-height-label"
          label="Upload Width Height Variants"
        />,
        !Reaction.hasPermission("createProduct") ? null :
        <div key="upload-width-height-form">{width_heightVariantUploadForm()}</div>,
        <Divider
          i18nKeyLabel="productDetail.options"
          label="Options"
          key="parent-variants-label"
        />,
        <ul
          className="variant-list list-unstyled"
          id="variant-list"
          key="render-parent-variants"
        >
          {this.renderVariants()}
        </ul>,
        <Divider
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
          key="child-variants-label"
        />,
        <div
          className="row variant-product-options"
          key="child-variants-chosen"
        >
          {this.renderChildVariants()}
        </div>
      ]}</div>
    );
  }
}

VariantList.propTypes = {
  childVariantMedia: PropTypes.arrayOf(PropTypes.any),
  childVariants: PropTypes.arrayOf(PropTypes.object),
  displayPrice: PropTypes.func,
  editable: PropTypes.bool,
  isSoldOut: PropTypes.func,
  onEditVariant: PropTypes.func,
  onMoveVariant: PropTypes.func,
  onVariantClick: PropTypes.func,
  onVariantVisibiltyToggle: PropTypes.func,
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;

var i = 0;
function renderList(type, list, props, methods) {
  switch(type) {
    case "variant" : {
      return renderVariantList(list, props, methods);
    }
    case WIDTH_HEIGHT_VARIANT_TYPE : {
      return renderWidthHeightList(list, props, methods);
    }
  }
}

function renderVariantList(list, props, methods) {
  return list.map((childVariant, index) => {
    const media = props.childVariantMedia.filter((mediaItem) => {
      if (mediaItem.metadata.variantId === childVariant._id) {
        return true;
      }
      return false;
    });
    

    return (
      <EditContainer
        data={childVariant}
        disabled={props.editable === false}
        editView="variantForm"
        i18nKeyLabel="productDetailEdit.editVariant"
        key={index}
        label="Edit Variant"
        onEditButtonClick={methods.handleChildVariantEditClick}
        onVisibilityButtonClick={methods.handleVariantVisibilityClick}
        permissions={["createProduct"]}
        showsVisibilityButton={true}
      >
        <ChildVariant
          isSelected={props.variantIsSelected(childVariant._id)}
          media={media}
          onClick={methods.handleChildleVariantClick}
          variant={childVariant}
        />
      </EditContainer>
    );
  });
}

