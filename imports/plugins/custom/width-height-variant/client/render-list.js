import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
import softwoodProducts from "../data/product-prices";

import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Divider, IconButton } from "/imports/plugins/core/ui/client/components";

// import { emptyOldVariants } from "/imports/plugins/custom/width-height-variant/server/startup";

const WIDTH_HEIGHT_OPTIONS = selectOptions();
function selectOptions() {
  let diameterOptions = [];
  for(let i=9;i<97;i++){
    diameterOptions.push(i);
  }
  return diameterOptions;
};

const EIGHTHS = [
  0, 1, 2, 3, 4, 5, 6, 7,
].map(function(num){
  return num.toString();
});


export default class RenderWidthHeightList extends Component {
  constructor(props) {
    super(props);
    var curProduct = ReactionProduct.selectedVariant()
    if(!curProduct || !curProduct.width && !curProduct.height){
      this.state = {
        widthHeightValues: {
          width: 24,
          widthEighth: "0",
          height: 36,
          heightEighth: "0",
        },
      };
    }else{
      this.state = {
        widthHeightValues: {
          width: curProduct.width,
          widthEighth: curProduct.widthEighth,
          height: curProduct.height,
          heightEighth: curProduct.heightEighth,
        },
      };
    }
  }
  update(productData, widthEighth, heightEighth) {
    this.commit(productData);
    return this.setState({
      widthHeightValues: productData
    });
  }

  commit(productData) {
    const parent = ReactionProduct.selectedVariant()._id;
    const newVariant = Products.findOne(addNewVariantIfNotExist(parent, productData));
    this.props.methods.handleChildleVariantClick(null, newVariant);
  }

  render() {
    /* */
    const { widthHeightValues } = this.state;

    return (<span>
      <Divider
          key="availableOptionsDivider"
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
      />
      <WidthHeightOptionDescription/>
      <div className="row variant-product-options" key="childVariantList">
        <div> {[
        dimensionSelect.call(this, "width", widthHeightValues, WIDTH_HEIGHT_OPTIONS, EIGHTHS, (val, eighth) => {

          const productData = {
            width: val,
            widthEighth: eighth,
            height: this.state.widthHeightValues.height,
            heightEighth: this.state.widthHeightValues.heightEighth,
          };
          productData.price = softwoodProducts.find(findPrice, productData).price;
          this.update(productData);
        }),
        dimensionSelect.call(this, "height", widthHeightValues, WIDTH_HEIGHT_OPTIONS, EIGHTHS, (val, eighth) => {

          const productData = {
            width: this.state.widthHeightValues.width,
            widthEighth: this.state.widthHeightValues.widthEighth,
            height: val,
            heightEighth: eighth,
          };
          productData.price = softwoodProducts.find(findPrice, productData).price;
          this.update(productData);
        }),
      ]}</div>
      </div>
    </span>);
  } // end RenderWidthHeightList.render()
}  // end RenderWidthHeightList()

/**
 * priceSlotCheck()
 * @summary check if the selected width/height is divisible by 6,
 * and therefore has a price associated. Otherwise,
 * find the modulus and subtract if from the selected
 * height/width to have a valid price to select.
 * @dimension {String} width/height to validate
 * @return {Number} Returns the found/valid price from product-prices.js
 */
function priceSlotCheck(dimension, eighth) {
  if (dimension % 6 !== 0) {
    let subtract = dimension % 6;
    return dimension = dimension - subtract + 6; // + 6 to round up to the next price
  } else if (eighth !== 0) {
    return dimension = dimension + 6;
  } else {
    return dimension;
  }
}

/**
  * findPrice()
  * @summary searches product-prices.js array for the price
  * matching the currently selected width/height.
  */
function findPrice(element) {
  // if ( this.width < 24 ) {
  //   this.width = 24;
  // }
  // if ( this.height < 30 ) {
  //   this.height = 30;
  // }
  let widthPrice = priceSlotCheck(this.width, this.widthEighth);
  let heightPrice = priceSlotCheck(this.height, this.heightEighth);
  if (element.width === widthPrice && element.height === heightPrice)
    return element;
}

export function WidthHeightOptionDescription() {
  const hrStyle = {
    width: '100%',
    background: '#1a99dd',
    height: '2px',
  }
  return (
    <div key="variant-product-options" className="row variant-product-options">
      <h2 style={{width: '100%'}}>Select Size</h2>
      <p>
        If you selected <b>Inside Mount</b>, enter your window size.
        <br/>
        For <b>Outside Mount</b>, enter the product size you want.
      </p>
      <hr style={hrStyle}/>
    </div>
  );
}

function WidthTitle() {
  return (
    <h3>Width <span>&harr;</span></h3>
  );
}
function HeightTitle() {
  return (
    <h3>Height <span>&#8597;</span></h3>
  );
}

function dimensionSelect(key, values, list, ethList, onChange) {
  let optionTitle = null;
  if ( key === "width" ) {
    optionTitle = <WidthTitle/>
  } else {
    optionTitle = <HeightTitle/>
  }

  return (
    <span className={key+"-selects"} key={key+"select-span"}>
      {optionTitle}
      <select
        className={"form-control " + key + "-select"}
        key={key + "-select"}
        value={values[key]}
        onChange={(e) =>{
          console.log(key, e.target.value);
          onChange(parseInt(e.target.value), values[key+"Eighth"])
        }}
      >
      { // loop to creation select options:
        list.map((opVal, index) => {
          return (
            <option
              className={"form-control"}
              key={"".concat(key, index.toString(), opVal.toString())}
              value={opVal}
            >{opVal}</option>
            );
        })
      }
      </select>
      <select
        className={"form-control " + key + "-select-8th"}
        key={key + "-select-8th"}
        value={values[key+"Eighth"]}
        onChange={(e) =>{
          console.log(key+"Eighth", e.target.value);
          onChange(values[key], parseInt(e.target.value))
        }}
      >
        { // loop to create 8ths options:
          ethList.map((opVal, index) => {
            return (
            <option
              className={"form-control" + key + "-select-8th"}
              key={"".concat(key, index.toString(), opVal.toString())}
              value={opVal}
              >{opVal}/8</option>
              );
          })
        }
      </select>
    </span>
  );
}

function formatElement(element) {
  const width = element.width;
  const height = element.height;
  const widthEighth = element.widthEighth;
  const heightEighth = element.heightEighth;
  const unique_key = width + " " + widthEighth + "/8 x " + height + " " + heightEighth + "/8";
  return {
    _id: formatID(element),
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood " + unique_key,
    optionTitle: "Softwood " + unique_key,
    price: element.price,
    height: height,
    width: width,
    widthEighth: element.widthEighth,
    heightEighth: element.heightEighth,
    isHeightWidth: true,
    weight: 0,
    inventoryQuantity: 9,
    inventoryPolicy: false,
    title: "Softwood " + unique_key,
    metafields: [
      {
        key: "Room",
        value: "",
      },
      {
        key: "Window Name",
        value: "",
      },
      {
        key: "Mount",
        value: "",
      },
      {
        key: "Height",
        value: element.height + " " + element.heightEighth + "/8th",
      },
      {
        key: "Width",
        value: element.width + " " + element.widthEighth + "/8th",
      },
      {
        key: "Color",
        value: "",
      },
      {
        key: "Slate Size",
        value: "",
      },
      {
        key: "Lift",
        value: "",
      },
      {
        key: "Lift Side",
        value: "",
      },
      {
        key: "Tilt",
        value: "",
      },
      {
        key: "Tilt Side",
        value: "",
      },
    ]
  };
}

function addNewVariantIfNotExist(parent, varientConfig) {
   try {
    return addNewVariant(parent, formatElement(varientConfig));
  } catch(e) {
    console.log("Variant already exists: ", e);
  }
}

// function emptyOldVariants(productId) {
//   const query = {
//     ancestors: { $in: [productId] },
//     type: "variant",
//     variantType: WIDTH_HEIGHT_VARIANT_TYPE,
//   };
//   const oldProducts = Products.find(query).fetch();
//   console.log("old products:", oldProducts.length)
//   Products.remove(query);
//   const eh = Products.find(query).fetch();
//   console.log("new length:", eh.length);

//   // oldProducts.forEach(function(p){
//   //   Products.insert(p);
//   // })

//   // oldDeleteVariants(productId);
//   // var deleted = deleteVariants(productId, WIDTH_HEIGHT_VARIANT_TYPE);
// }

// TODO
// After cleanBlinds(), variants arestill in the DB
// Maybe we need to use Products.remove()
// function cleanBlinds(variantId) {
//   const product = ReactionProduct.selectedProduct();
//   const oldVariants = ReactionProduct.getVariants();

//   const clearVariants = oldVariants.filter(function(variant) {
//     if (variant.ancestors.length > 1 &&
//         variant.variantType === "Height & Width" &&
//         variant._id !== variantId) {
//       return variant;
//     }
//   });

//   clearVariants.forEach(function(item) {
//     Meteor.call("products/deleteVariant", item._id);
//   });

//   Meteor.call("revisions/publish", product._id);
// }

function formatID(element){
  const width = element.width;
  const height = element.height;
  const widthEighth = element.widthEighth;
  const heightEighth = element.heightEighth;
  const unique_key = width + "-" + widthEighth + "x" + height + "-" + heightEighth;
  return "Softwood" + unique_key + "Price" + element.price;
}

function addNewVariant(parentId, newVariant) {

  console.log(newVariant._id);
  if (Products.findOne(newVariant._id)) {
    console.log("Variant already exists: ", newVariant._id);
    return newVariant._id;
  }

  const newVariantId = newVariant._id;
  // get parent ancestors to build new ancestors array
  const product = Products.findOne(parentId);
  const { ancestors } = product;

  /**
   * Verify that the parent variant and any ancestors are not deleted.
   * Child variants cannot be added if a parent product or product revision
   * is marked as `{ isDeleted: true }`
   *
   */
  // if (ReactionProduct.isAncestorDeleted(product, true)) {
  //   throw new Meteor.Error(403, "Unable to create product variant");
  // }

  Array.isArray(ancestors) && ancestors.push(parentId);
  console.log(
    `addNewVariant(${parentId}, ${newVariant._id}) \n`,
    `From: /imports/plugins/custom/width-height-variant/client/render-list.js`
  );

  const assembledVariant = Object.assign(newVariant || {}, {
    _id: newVariantId,
    ancestors: ancestors,
    type: "variant",
    isVisible: true,
  });

  if (!newVariant) {
    Object.assign(assembledVariant, {
      title: "",
      price: 0.00,

    });
  }

  /**
    * If we are inserting child variant to top-level variant, we need to remove
    * all top-level's variant inventory records and flush it's quantity,
    * because it will be hold sum of all it descendants quantities.
    */
  // if (ancestors.length === 2) {
  //   flushQuantity(parentId);
  // }

  console.log(Products, ReactionProduct, Reaction);

  Products.insert(assembledVariant,
    (error, result) => {
      if(error){
        console.error(error);
      }
      if (result) {
        console.log(
          `products/createVariant: created variant: ${
            newVariantId} for ${parentId}`
        );
      }
    }
  );

  // cleanBlinds(newVariantId); // Remove existing blind child variants from the DB so that new variants don't get junked up

  return newVariantId;
}

// function flushQuantity(id) {
//   const variant = Products.findOne(id);
//   /**
//   * if variant already have descendants, quantity should be 0,
//   * and we don't need to do all next actions
//   */
//   if (variant.inventoryQuantity === 0) {
//     return 1; // let them think that we have one successful operation here
//   }

//   return Products.update({
//     _id: id,
//   }, {
//     $set: {
//       inventoryQuantity: 0,
//     }
//   }, {
//     selector: {
//       type: "variant",
//     }
//   });
// }

export { addNewVariantIfNotExist };