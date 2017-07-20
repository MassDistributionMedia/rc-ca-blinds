import React, { Component, PropTypes } from "react";
import { ReactionLayout } from "/imports/plugins/core/layout/lib";
import { AlertContainer } from "/imports/plugins/core/ui/client/containers";

class ProductDetail extends Component {
  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  render() {
    return (
      <div className="pdp" style={{ position: "relative" }}>
        <div className="container container-main pdp-container" itemScope itemType="http://schema.org/Product">
          <div className="row">
            <AlertContainer placement="productManagement" />
            <ReactionLayout
              context={this}
              layoutName={this.props.layout}
              layoutProps={this.props}
            />
          </div>
        </div>
      </div>
    );
  }
}

ProductDetail.propTypes = {
  editable: PropTypes.bool,
  layout: PropTypes.string,
  viewAs: PropTypes.string,
  product: PropTypes.object,
  onAddToCart: PropTypes.func,
  layoutName: PropTypes.string,
  cartQuantity: PropTypes.number,
  onDeleteProduct: PropTypes.func,
  socialComponent: PropTypes.node,
  hasAdminPermission: PropTypes.bool,
  handleVariantChoice: PropTypes.func,
  topVariantComponent: PropTypes.node,
  onViewContextChange: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onProductFieldChange: PropTypes.func,
  mediaGalleryComponent: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.object),
  priceRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ProductDetail;
