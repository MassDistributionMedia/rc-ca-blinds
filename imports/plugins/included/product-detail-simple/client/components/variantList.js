import React, { Component, PropTypes} from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, Translation } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";
import SelectField from 'material-ui/SelectField'; // http://www.material-ui.com/#/components/select-field
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/#/components/select-field

class VariantList extends Component {
  constructor(props) {
    super(props);
    this.handleChildleVariantClick = this.handleChildleVariantClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = { 
      /* initial state */
      value: '',
    };
  }

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

  handleChildleVariantClick (event, variant) {
    this.setState({value: variant.height});
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
    if (this.props.variants) {
      return this.props.variants.map((variant, index) => {
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
              isHeightWidth={variant.isHeightWidth}
              onClick={this.props.onVariantClick}
              onMove={this.props.onMoveVariant}
              soldOut={this.isSoldOut(variant)}
              variant={variant}
            />
          </EditContainer>
        );
      });
    }

    return (
      <li>
        <a href="#" id="create-variant">
          {"+"} <Translation defaultValue="Create Variant" i18nKey="variantList.createVariant" />
        </a>
      </li>
    );
  }
  
  // TODO
  // - Try custom component inside this file
  // - Try accessing data-attribute:
  //   - https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes

  renderChildVariants() {
    if (this.props.childVariants) {
      return this.props.childVariants.map((childVariant, index) => {
        const media = this.props.childVariantMedia.filter((mediaItem) => {
          if (mediaItem.metadata.variantId === childVariant._id) {
            return true;
          }
          return false;
        });
        
        return (
            <ChildSelectOption 
              key={index}
              value={this.state.value}
              isSelected={this.props.variantIsSelected(childVariant._id)}
              onValueChange={this.handleChildleVariantClick.bind(this)}
              variant={childVariant}
            />
        );
      });
    }

    return null;
  }
  
  handleChange = (event, index) => {
    const value = event.target.value;
    this.setState({value});
    debugger;
  }

  render() {
    return (
      <div className="product-variants">
        <Divider
          i18nKeyLabel="productDetail.options"
          label="Options"
        />
        <ul className="variant-list list-unstyled" id="variant-list">
          {this.renderVariants()}
        </ul>
        <Divider
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
        />
        <div className="row variant-product-options">
          <select
            value={this.state.value}
            onChange={this.handleChange}
          >
            {this.renderChildVariants()}
          </select>
        </div>
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
  isHeightWidth: PropTypes.bool,
  onEditVariant: PropTypes.func,
  onMoveVariant: PropTypes.func,
  onVariantClick: PropTypes.func,
  onVariantVisibiltyToggle: PropTypes.func,
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

class ChildSelectOption extends Component {
  handleChange = (event, index) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(event, this.props.variant);
    }
  }
  render() {
    const variant = this.props.variant;
    return (
      <option
        onClick={this.handleChange.bind(this)} 
        value={this.props.value} 
      >
        {variant.height}
      </option>
    )
  }
};

ChildSelectOption.propTypes = {
  value: PropTypes.any,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  variant: PropTypes.object,
};

export default VariantList;
