import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import * as SelectedVariants from "../stores/selected-variants";


class ProductMetadata extends Component {
  get metafields() {
    // let metafields = [];
    return this.props.metafields || this.props.product.metafields;
    // metafields = this.props.metafields || this.props.product.metafields;

    // metafields = metafields.concat(SelectedVariants.retrieveMetaValues());

    // return metafields;
  }
  // get metafields() {
  //   let metafields = [];
  //   if (this.props.metafields) {
  //     metafields = metafields.concat(this.props.metafields);
  //   }
  //   const { product } = this.props;
  //   if (product && product.metafields) {
  //     metafields = metafields.concat(product.metafields.filter((meta) => {
  //       for (let i = 0; i < metafields.length; i += 1) {
  //         if (metafields[i].key === meta.key) {
  //           return false;
  //         }
  //       }
  //       return true;
  //     }));
  //   }

  //   metafields = metafields.concat(SelectedVariants.retrieveMetaValues());

  //   return metafields;
  // }

  // componentDidMount() {
  //   this.updateListener = () => {
  //     this.setState({ timestamp: Date.now() });
  //   };
  //   SelectedVariants.onUpdate(this.updateListener);
  // }

  // componentWillUnmount() {
  //   SelectedVariants.offUpdate(this.updateListener);
  // }

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
