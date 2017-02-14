import React, { Component, PropTypes } from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, IconButton } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";

import renderWidthHeightList, {
  WidthHeightOptionDescription,
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
    const addButton = this.props.editable ? (
      <div className="rui items flex">
        <div className="rui item full justify center">
          <IconButton
            i18nKeyTooltip="variantList.createVariant"
            icon="fa fa-plus"
            tooltip="Create Variant"
            onClick={this.props.onCreateVariant}
          />
        </div>
      </div>
    ) : null;

    if(!this.props.variants || this.props.variants.length === 0) {
      if (this.props.editable === false){
        return (
          <ul className="variant-list list-unstyled" id="variant-list" key="variantList"></ul>
        );
      }
      return [
        <Divider
          i18nKeyLabel="productDetail.options"
          key="dividerWithLabel"
          label="Options"
        />,
        <ul className="variant-list list-unstyled" id="variant-list" key="variantList">
          {addButton}
        </ul>
      ];
    }

    let variants = this.props.variants;
    let offset = this.state && this.state.offset || 0;
    let toRender = variants.length > 10 ? variants.slice(offset, 10) : variants;
    const renderedVariants = (
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

    const variantList = (
      <ul className="variant-list list-unstyled" id="variant-list" key="variantList">
        {renderedVariants}
        {addButton}
      </ul>
    );

    if (variants.length > 1) {
      return [
        <Divider
          i18nKeyLabel="productDetail.options"
          key="dividerWithLabel"
          label="Options"
        />,
        variantList
      ];
    } else if (variants.length === 1) {
      return [
        <Divider key="divider" />,
        variantList
      ];
    }

    return variantList;
  }

  renderChildVariants() {
    if (!this.props.childVariants) {
      return null;
    }
    let childVariantType = '';
    const lists = this.props.childVariants.reduce((variants, childVariant, index) => {
      const type = childVariant.variantType || "variant";
      childVariantType = type;
      if(!(type in variants)) {
        variants[type] = [];
      }
      variants[type].push(childVariant);

      return variants;
    }, {});
    let methods = this;
    let props = this.props;

    let optionDescription = null;
    if ( childVariantType === WIDTH_HEIGHT_VARIANT_TYPE ) {
      optionDescription = <WidthHeightOptionDescription/>
    }

    return (
      <span>
      <Divider
          key="availableOptionsDivider"
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
        />
      {optionDescription}
      <div className="row variant-product-options" key="childVariantList">{
        Object.keys(lists).map(function(type){
          const list = lists[type];
          return (<div key={"".concat("rendered-list", "-", type)}>
            {renderList(type, list, props, methods)}
          </div>)
        })
      }</div>
      </span>
    );
    // let list = this.props.childVariants.filter(function(variant) {
    //   return !!variant.width && !!variant.height;
    // })
    // return renderWidthHeightList(list, this.props, this.methods);
  }

  render() {
    return (
      <div className="product-variants">
        {this.renderVariants()}
        {this.renderChildVariants()}
      </div>
    );
  }
}

VariantList.propTypes = {
  childVariantMedia: PropTypes.arrayOf(PropTypes.any),
  childVariants: PropTypes.arrayOf(PropTypes.object),
  displayPrice: PropTypes.func,
  editable: PropTypes.bool,
  isSoldOut: PropTypes.func,
  onCreateVariant: PropTypes.func,
  onEditVariant: PropTypes.func,
  onMoveVariant: PropTypes.func,
  onVariantClick: PropTypes.func,
  onVariantVisibiltyToggle: PropTypes.func,
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;

let i = 0;
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

