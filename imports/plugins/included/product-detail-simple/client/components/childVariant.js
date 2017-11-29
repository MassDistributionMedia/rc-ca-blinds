import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
<<<<<<< HEAD
import { Translation } from "/imports/plugins/core/ui/client/components";
import { MediaItem } from "/imports/plugins/core/ui/client/components";
import MenuItem from 'material-ui/MenuItem';

class ChildVariant extends Component {
  handleClick = (event, index) => {
=======
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Validation } from "@reactioncommerce/reaction-collections";
import { ProductVariant } from "/lib/collections/schemas/products";


class ChildVariant extends Component {
  constructor(props) {
    super(props);

    this.validation = new Validation(ProductVariant);

    this.state = {
      invalidVariant: false
    };
  }

  componentWillMount() {
    this.variantValidation();
  }


  handleClick = (event) => {
>>>>>>> upstream/master
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  get hasMedia() {
    return Array.isArray(this.props.media) && this.props.media.length > 0;
  }

  get primaryMediaItem() {
    if (this.hasMedia) {
      return this.props.media[0];
    }

    return null;
  }

  renderInventoryStatus() {
    const {
      inventoryManagement,
      inventoryPolicy
    } = this.props.variant;

    // If childVariant is sold out, show Sold Out badge
    if (inventoryManagement && this.props.variant.inventoryQuantity <= 0) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-danger child-variant-badge-label">
            <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info child-variant-badge-label">
          <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    return null;
  }

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Components.Translation className="deleted-variant-text" defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  renderMedia() {
    if (this.hasMedia) {
      const media = this.primaryMediaItem;

      return (
        <Components.MediaItem source={media.url()} />
      );
    }

    return null;
  }
  
  // http://stackoverflow.com/questions/26176519/reactjs-call-parent-function
  // http://stackoverflow.com/questions/30580638/pass-parent-prop-to-children-reactjs?rq=1

  renderValidationButton = () => {
    if (this.state.invalidVariant === true) {
      return (
        <Components.Badge
          status="danger"
          indicator={true}
          tooltip={"Validation error"}
          i18nKeyTooltip={"admin.tooltip.validationError"}
          onClick={this.handleClick}
        />
      );
    }
  }

  // checks whether the product variant is validated
  variantValidation = () => {
    const invalidVariant = this.validation.validate(this.props.variant);

    this.setState({
      invalidVariant: !invalidVariant.isValid
    });
  }

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-button": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted,
      "variant-notVisible": !this.props.variant.isVisible
    });
    
    if ( this.props.isHeightWidth ) {
      return (
        <MenuItem onClick={this.handleClick} value={variant.height} primaryText={variant.height + "\""} />
      );  
    }
    
    return (
      <div className="variant-select-option">
        <button
          className={classes}
          onClick={this.handleClick}
          type="button"
        >
          {this.renderMedia()}
          <span className="title">{variant.optionTitle}</span>
        </button>
<<<<<<< HEAD
        <div className="variant-controls">
=======

        <div className="variant-controls custom-variant-control">
>>>>>>> upstream/master
          {this.renderDeletionStatus()}
          {this.renderInventoryStatus()}
          {this.renderValidationButton()}
          {this.props.editButton}
        </div>
      </div>
    );
  }
};

ChildVariant.propTypes = {
  editButton: PropTypes.node,
  isSelected: PropTypes.bool,
  media: PropTypes.arrayOf(PropTypes.object),
<<<<<<< HEAD
  onClick: PropTypes.func,
  onChange: PropTypes.func,
=======
  onClick: PropTypes.func.isRequired,
  soldOut: PropTypes.bool,
>>>>>>> upstream/master
  variant: PropTypes.object,
  visibilityButton: PropTypes.node
};

<<<<<<< HEAD
=======
registerComponent("ChildVariant", ChildVariant);

>>>>>>> upstream/master
export default ChildVariant;
