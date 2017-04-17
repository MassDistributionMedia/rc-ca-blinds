import Variant from "./variant";
import { ChildVariant } from "./";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import React, { Component, PropTypes } from "react";
import { getChildVariant } from "../selectors/variants";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, IconButton } from "/imports/plugins/core/ui/client/components";

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
    let variants = [];
    let addButton;

    if (this.props.editable) {
      addButton = (
        <div className="rui items flex">
          <div className="rui item full justify center">
            <IconButton
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
        if (variant.hasOwnProperty('isProductBundle') && variant.isProductBundle) {
          return null;
        }

        const childVariants = getChildVariant(variant.title);
        const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);
        const currentVariant = variant;
        const type = currentVariant.variantType || "variant";
        const methods = this;
        const props = this.props;
        const divStyle = {
          display: "none"
        };
        const childVariantContainer = <div className="accordion" id={variant._id} style={divStyle}>
                                        <RenderList
                                          renderType={type}
                                          renderList={props.childVariants}
                                          parentProps={props}
                                          childVariants={childVariants}
                                          parentMethods={methods}
                                        />
                                      </div>;

        return (
          [<EditContainer
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
              renderChildVariants={this.renderChildVariants}
              {...this.props}
            />
          </EditContainer>,
          childVariantContainer
         ]
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

  render() {
    return (
      <div className="product-variants">
        {this.renderVariants()}
      </div>
    );
  }
}

VariantList.propTypes = {
  editable: PropTypes.bool,
  isSoldOut: PropTypes.func,
  displayPrice: PropTypes.func,
  onEditVariant: PropTypes.func,
  onMoveVariant: PropTypes.func,
  onVariantClick: PropTypes.func,
  onCreateVariant: PropTypes.func,
  variantIsSelected: PropTypes.func,
  onVariantVisibiltyToggle: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object),
  childVariants: PropTypes.arrayOf(PropTypes.object),
  childVariantMedia: PropTypes.arrayOf(PropTypes.any)
};

export default VariantList;

function RenderList(props) {
  const {
    renderType,
    renderList,
    parentProps,
    childVariants,
    parentMethods
  } = props;

  switch(renderType) {
    case "variant" : {
      return (<RenderVariantList
        renderList={childVariants}
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

function RenderVariantList({ renderList, parentProps, methods }) {
  if (!renderList) {
    return null;
  }

  return (
    <span>
      <Divider
          key="availableOptionsDivider"
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
      />
      <div className="row variant-product-options" key="childVariantList">
        <div>{
          renderList.map((childVariant, index) => {
            const media = parentProps.childVariantMedia.filter((mediaItem) => {
              if (mediaItem.metadata.variantId === childVariant._id) {
                return true;
              }
              return false;
            });

            return (
              <EditContainer
                data={childVariant}
                disabled={parentProps.editable === false}
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
                  isSelected={parentProps.variantIsSelected(childVariant._id)}
                  media={media}
                  onClick={methods.handleChildleVariantClick}
                  variant={childVariant}
                />
              </EditContainer>
            );
          })
        }</div>
      </div>
    </span>);
}  // end RenderVariantList()

