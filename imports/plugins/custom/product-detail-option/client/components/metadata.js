import classnames from "classnames";
import { ReactionProduct } from "/lib/api";
import React, { Component } from "react";
import PropTypes from "prop-types";
import * as SelectedVariants from "../stores/selected-variants";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Metadata, Translation } from "/imports/plugins/core/ui/client/components/";

class ProductMetadata extends Component {
  get metafields() {
    var metafields = [];

    if(this.props.metafields){
      metafields = metafields.concat(this.props.metafields);
    }

    var product = this.props.product;
    if(product && product.metafields){
      metafields = metafields.concat(product.metafields.filter(function(meta){
        for(var i = 0; i < metafields.length; i++){
          if(metafields[i].key === meta.key){
            return false;
          }

          return true;
        }
      }));
    }

    metafields = metafields.concat(SelectedVariants.retrieveMetaValues());

    return metafields;
  }

  componentDidMount(){
    this.updateListener = ()=>{
      this.setState({ timestamp: Date.now() });
    };
    SelectedVariants.onUpdate(this.updateListener);
  }

  componentWillUnmount(){
    SelectedVariants.offUpdate(this.updateListener);
  }

  get showEditControls() {
    return this.props.product && this.props.editable;
  }

  renderEditButton() {
    if (this.showEditControls) {
      return (
        <span className="edit-button">
          <EditContainer
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
            <Translation defaultValue="Details" i18nKey="productDetail.details" />
            {this.renderEditButton()}
          </h3>
          <Metadata editable={false} metafields={this.metafields} />
        </div>
      );
    }

    return null;
  }
}

ProductMetadata.propTypes = {
  editable: PropTypes.bool,
  product: PropTypes.object,
  editContainerProps: PropTypes.object,
  metafields: PropTypes.arrayOf(PropTypes.object)
};

export default ProductMetadata;
