import React, { Component, PropTypes} from "react";
import Variant from "/imports/plugins/included/product-detail-simple/client/components/variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, Translation } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "/imports/plugins/included/product-detail-simple/client/components/";

class VariantList extends Component {
  constructor(props) {
    super(props);
    this.onChangeWidth = this.onChangeWidth.bind(this);
    this.onChangeHeight = this.onChangeHeight.bind(this);
    this.createKey.bind(this);
    this.state = {
      /* initial state */
      selectedVariant: this.props.childVariants ? this.props.childVariants[0] : null,
      value: '',
    };
  }
  
  componentWillMount() {
    this.compileIndexes(this.props)
  }

  componentDidMount() {
    if (this.props.onVariantClick && this.state.selectedVariant) {
      this.props.onVariantClick(null, this.state.selectedVariant, 1);
    }
  }

  componentWillUpdate(nextProps) {
    if(this.props.childVariants && this.props.childVariants.length == nextProps.childVariants.length) {
      return;
    }
    this.compileIndexes(nextProps);
  }
  
  onChangeHeight(event) {
    var value = event.target.value;
    this.updateVariant(value, this.state.selectedVariant.width);
  }

  onChangeWidth(event) {
    var value = event.target.value;
    this.updateVariant(this.state.selectedVariant.height, value);
  }
  
  updateVariant(height, width) {
    var key = this.createKey(height, width);
    var indexes = this.indexedVariants.indexes;
    if(!(key in indexes)){
      debugger;
      throw new Error("invalid key combination");
    }
    var variant = indexes[key];
    this.setState({
      selectedVariant: variant,
    });
    if (this.props.onVariantClick) {
      this.props.onVariantClick(null, variant, 1);
    }
    /*
          const media = this.props.childVariantMedia.filter((mediaItem) => {
        if (mediaItem.metadata.variantId === childVariant._id) {
          return true;
        }
        return false;
      });
      
    */
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

  handleChildleVariantClick (event) {
    var selectedIndex = event.target.selectedIndex;
    var variant = this.props.childVariants[selectedIndex];
    this.setState({
      value: variant.height,
      selectedVariant: variant
    });
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
  
  renderChildVariants(list, uniqueName) {
    return list.map((dimensionValue, index) => {
      return (
        <option
          className="form-control"
          key={"".concat(uniqueName, index.toString(), dimensionValue.toString())}
          value={dimensionValue}
        >
          {dimensionValue}
        </option>
      );
    });
  }

  render() {
    var selectedHeight, selectedWidth;
    if(this.state.selectedVariant) {
      selectedHeight = this.state.selectedVariant.height;
      selectedWidth = this.state.selectedVariant.width;
    }
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
        <div className="row variant-product-options">{
          !this.props.childVariants ? null : [
            <select
              className="form-group"
              value={selectedHeight}
              onChange={this.onChangeHeight}
            >
              {this.renderChildVariants(this.indexedVariants.heightList, "height")}
            </select>,
            <select
              value={selectedWidth}
              onChange={this.onChangeWidth}
            >
              {this.renderChildVariants(this.indexedVariants.widthList, "width")}
            </select>
          ]
        }</div>
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

export default VariantList;
