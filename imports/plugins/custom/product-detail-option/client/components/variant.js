import classnames from "classnames";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import React, { Component, PropTypes } from "react";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";
import { Divider, IconButton } from "/imports/plugins/core/ui/client/components";
import { Currency, Translation } from "/imports/plugins/core/ui/client/components";

import RenderWidthHeightList, {
  WIDTH_HEIGHT_VARIANT_TYPE,
  width_heightVariantUploadForm,
} from "/imports/plugins/custom/width-height-variant/client/render-list";

class Variant extends Component {

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  get price() {
    return this.props.displayPrice || this.props.variant.price;
  }

  renderInventoryStatus() {
    const {
      inventoryManagement,
      inventoryPolicy
    } = this.props.variant;

    // If variant is sold out, show Sold Out badge
    if (inventoryManagement && this.props.soldOut) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-danger">
            <Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info">
          <Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    // If Warning Threshold is met, show Limited Supply Badge
    if (inventoryManagement && this.props.variant.lowInventoryWarningThreshold >= this.props.variant.inventoryTotal) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-warning">
            <Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info">
          <Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    return null;
  }

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  renderChildVariants(variant) {

    const currentVariant = variant;

    const type = currentVariant.variantType || "variant";
    const methods = this;
    const props = this.props;

    return (
      <RenderList
        renderType={type}
        renderList={props.childVariants}
        parentProps={props}
        parentMethods={methods}
      />
    );
  } // end renderChildVariants()

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "variant-detail": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted
    });

    if (!variant.hasOwnProperty('isProductBundle') || !variant.isProductBundle) {
      let variantTitleElement;

      if (typeof variant.title === "string" && variant.title.length) {
        variantTitleElement = (
          <span className="variant-title">{variant.title}</span>
        );
      } else {
        variantTitleElement = (
          <Translation defaultValue="Label" i18nKey="productVariant.title" />
        );
      }

      const variantElement = (
        <li
          className="variant-list-item"
          id="variant-list-item-{variant._id}"
          key={variant._id}
          onClick={this.handleClick}
        >
          <div className={classes}>
            <div className="title">
              {variantTitleElement}
            </div>

            <div className="actions">
              <span className="variant-price">
                <Currency amount={this.price} editable={this.props.editable}/>
              </span>
            </div>

            <div className="alerts">
              {this.renderDeletionStatus()}
              {this.renderInventoryStatus()}
              {this.props.visibilityButton}
              {this.props.editButton}
            </div>
          </div>
          <div></div>
        </li>
      );

      if (this.props.editable) {
        return this.props.connectDragSource(
          this.props.connectDropTarget(
            variantElement
          )
        );
      }

      return variantElement;
    }
    else {
      return null;
    }
  }
}

Variant.propTypes = {
  onClick: PropTypes.func,
  soldOut: PropTypes.bool,
  editable: PropTypes.bool,
  variant: PropTypes.object,
  editButton: PropTypes.node,
  isSelected: PropTypes.bool,
  isHeightWidth: PropTypes.bool,
  visibilityButton: PropTypes.node,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  displayPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default SortableItem("product-variant", Variant);

function RenderList(props) {
  const {
    renderType,
    renderList,
    parentProps,
    parentMethods,
  } = props;

  switch(renderType) {
    case "variant" : {
      return (<RenderVariantList
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

function RenderVariantList({ renderList, parentProps, methods }) {
  console.log('renderList', renderList);
  if (!renderList) {
    console.log('here');
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

