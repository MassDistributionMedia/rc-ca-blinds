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
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
        />
        <div className="row variant-product-options">
          <h2>Select Size</h2>
          <p>
             If you selected Inside Mount, enter your window size.
             <br/>
             For Outside Mount, enter the product size you want.
          </p>
          <hr style="
            width: 100%;
            background: #1a99dd;
            height: 2px;
          "/>
          {
          !this.props.childVariants ? null : [
            renderList(
              "height", this.indexedVariants.heightList, selectedHeight,
              this.onChangeHeight,
              function(){}
            ),
            renderList(
              "width", this.indexedVariants.widthList, selectedWidth,
              this.onChangeWidth,
              function(){}
            ),
          ]
        }</div>
      </div>
    );
  }
}

function renderList(key, list, selected, onChange, onEightChange){
  return <div style="display:inline-block" >
  <div>
    <h3>Width &harr;</h3>
    <select
      className="form-group"
      value={selected}
      onChange={onChange}
    >{list.map((dimensionValue, index) => {
      return (
        <option
          className="form-control"
          key={"".concat(key, index.toString(), dimensionValue.toString())}
          value={dimensionValue}
        >{dimensionValue}</option>
      );
    })}</select>
    <h3>Height &#8597;</h3>
    <select
      className="form-group"
      value={selectedHeight}
      onChange={this.onChangeHeight}
    >{(function(){
        var ret = [];
        for(var i = 0; i < 8; i++) {
          ret.push(
            <option
              className="form-control"
              key={"".concat(key, "-eight-", i)}
              value={i/8}
              onChange={onEightChange}
            >{i +"/" + 8}</option>
          );
        }
        return ret;
      })()}</select>
  </div>
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
