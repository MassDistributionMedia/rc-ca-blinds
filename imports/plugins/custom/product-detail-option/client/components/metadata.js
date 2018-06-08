import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import SelectedVariants from "../stores/selectedVariants";


class ProductMetadata extends Component {
  selectedVariants = new SelectedVariants();
  
  get metafields() {
    let metafields = [];
    metafields = metafields.concat(
      this.props.metafields || this.props.product.metafields,
      this.selectedVariants.retrieveMetaValues(),
    );

    return metafields;
  }

  componentDidMount() {
    this.updateListener = () => {
      this.setState({ timestamp: Date.now() });
    };
    this.selectedVariants.onUpdate(this.updateListener);
  }

  componentWillUnmount() {
    this.selectedVariants.offUpdate(this.updateListener);
  }

  get showEditControls() {
    return this.props.product && this.props.editable;
  }

  renderEditButton() {
    if (this.showEditControls) {
      return (
        <span className="edit-button">
          <Components.EditContainer
            data={this.props.product}
            disabled={this.props.editable === false}
            editTypes={["edit"]}
            editView="ProductAdmin"
            field="metafields"
            i18nKeyLabel="productDetailEdit.productSettings"
            label="Product Settings"
            permissions={["createProduct"]}
            {...this.props.editContainerProps}
          />
        </span>
      );
    }

    return null;
  }

  render() {
    if (Array.isArray(this.metafields) && this.metafields.length > 0) {
      const headerClassName = classnames({
        "meta-header": true,
        "edit": this.showEditControls
      });

      return (
        <div className="pdp product-metadata">
          <h3 className={headerClassName}>
            <Components.Translation defaultValue="Details" i18nKey="productDetail.details" />
            {this.renderEditButton()}
          </h3>
          <Components.Metadata editable={false} metafields={this.metafields} />
        </div>
      );
    }

    return null;
  }
}

ProductMetadata.propTypes = {
  editContainerProps: PropTypes.object,
  editable: PropTypes.bool,
  metafields: PropTypes.arrayOf(PropTypes.object),
  product: PropTypes.object
};

registerComponent("ProductMetadata", ProductMetadata);

export default ProductMetadata;
