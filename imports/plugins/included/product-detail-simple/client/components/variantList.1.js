import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { ReactionProduct } from "/lib/api";

import RenderWidthHeightList, {
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

  handleChildVariantClick = (event, variant) => {
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
    let variants = [];
    let addButton;

    if (this.props.editable) {
      addButton = (
        <div className="rui items flex">
          <div className="rui item full justify center">
            <Components.IconButton
              i18nKeyTooltip="variantList.createVariant"
              icon="fa fa-plus"
              primary={true}
              tooltip="Create Variant"
              onClick={this.props.onCreateVariant}
            />
          </div>
        </div>
      );
    }

    if (this.props.variants) {
      variants = this.props.variants.map((variant, index) => {
        const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);

        return (
          <Components.EditContainer
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
            <Components.Variant
              displayPrice={displayPrice}
              editable={this.props.editable}
              index={index}
              isSelected={this.props.variantIsSelected(variant._id)}
              onClick={this.props.onVariantClick}
              onMove={this.props.onMoveVariant}
              soldOut={this.isSoldOut(variant)}
              variant={variant}
            />
          </Components.EditContainer>
        );
      });
    }

    const variantList = (
      <ul className="variant-list list-unstyled" id="variant-list" key="variantList">
        {variants}
        {addButton}
      </ul>
    );

    if (variants.length === 0 && this.props.editable === false) {
      return variantList;
    } else if (variants.length > 1 || variants.length === 0) {
      return [
        <Components.Divider
          i18nKeyLabel="productDetail.options"
          key="dividerWithLabel"
          label="Options"
        />,
        variantList
      ];
    } else if (variants.length === 1) {
      return [
        <Components.Divider key="divider" />,
        variantList
      ];
    }

    return variantList;
  }

  renderChildVariants() {
    /**
     * This `if` is to handle error:
     *  Exception from Tracker recompute function
     *  Which happens on one of Meteor's cycles
     *  see: http://stackoverflow.com/a/42896843/1762493
     */
    if (ReactionProduct.selectedVariant() === null) {
      return; // or return null;
    }
    const currentVariant = ReactionProduct.selectedVariant();

    const type = currentVariant.variantType || "variant";
    const methods = this;
    const props = this.props;
    
    let childVariants = [];

    if (this.props.childVariants) {
      childVariants = this.props.childVariants.map((childVariant, index) => {
        const media = this.props.childVariantMedia.filter((mediaItem) => {
          if (mediaItem.metadata.variantId === childVariant._id) {
            return true;
          }
          return false;
        });

        return (
          <Components.EditContainer
            data={childVariant}
            disabled={this.props.editable === false}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            onEditButtonClick={this.handleChildVariantEditClick}
            onVisibilityButtonClick={this.handleVariantVisibilityClick}
            permissions={["createProduct"]}
            showsVisibilityButton={true}
          >
            <Components.ChildVariant
              isSelected={this.props.variantIsSelected(childVariant._id)}
              media={media}
              onClick={this.handleChildVariantClick}
              variant={childVariant}
            />
          </Components.EditContainer>
        );
      });
    }

    if (childVariants.length) {
      return [
        <Components.Divider
          key="availableOptionsDivider"
          i18nKeyLabel="availableOptions"
          label="Available Options"
        />,
        <div className="row variant-product-options" key="childVariantList">
          {childVariants}
        </div>
      ];
    }

    return null;
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
  variants: PropTypes.arrayOf(PropTypes.object),
};

export default VariantList;

function RenderList(props) {
  const {
    renderType,
    renderList,
    parentProps,
    parentMethods,
  } = props;

  switch(renderType) {
    case "variant" : {
      return ( <RenderVariantList
        renderList={renderList}
        parentProps={parentProps}
        methods={parentMethods}
      />
      );
    }
    case WIDTH_HEIGHT_VARIANT_TYPE : {
      return (<RenderWidthHeightList
        renderList={renderList}
        methods={parentMethods}
      />);
    }
  }
}

function RenderVariantList({ renderList }) {
    if (!renderList) {
    return null;
  }

  return (
    <Components.EditContainer
      data={childVariant}
      disabled={this.props.editable === false}
      editView="variantForm"
      i18nKeyLabel="productDetailEdit.editVariant"
      key={index}
      label="Edit Variant"
      onEditButtonClick={this.handleChildVariantEditClick}
      onVisibilityButtonClick={this.handleVariantVisibilityClick}
      permissions={["createProduct"]}
      showsVisibilityButton={true}
    >
      <Components.ChildVariant
        isSelected={this.props.variantIsSelected(childVariant._id)}
        media={media}
        onClick={this.handleChildVariantClick}
        variant={childVariant}
      />
    </Components.EditContainer>
  );
}  // end RenderVariantList()

