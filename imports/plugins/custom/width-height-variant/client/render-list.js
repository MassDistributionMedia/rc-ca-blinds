import React, { Component } from "react";
// import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import softwoodProducts from "../data/product-prices";
import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
// import { Components } from "@reactioncommerce/reaction-components";
// import { emptyOldVariants } from "/imports/plugins/custom/width-height-variant/server/startup";

const WIDTH_HEIGHT_OPTIONS = selectOptions();
const SPLIT_OPTIONS = ["none", "2in1", "3in1"];
  const hrStyle = {
    width: "100%",
    background: "#1a99dd",
    height: "2px",
  };

function selectOptions() {
  const diameterOptions = [];
  for (let i = 9; i < 97; i++) {
    diameterOptions.push(i);
  }

  return diameterOptions;
}

const EIGHTHS = [
  "0", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8",
].map(function (num) {
  return num.toString();
});

export default class RenderWidthHeightList extends Component {
  constructor(props) {
    const curProduct = ReactionProduct.selectedVariant();
    super(props);
    console.info('RenderWidthHeightList current product: \n\n', curProduct);

    this.state = {
      widthHeightValues: {
        width: curProduct.width || 24,
        widthEighth: curProduct.widthEighth || "0",
        height: curProduct.height || 36,
        heightEighth: curProduct.heightEighth || "0",
        blindType: curProduct.blindType || "none"
      },
    };

    // this.initHeightWidthValues(curProduct);
  }

  // initHeightWidthValues(curProduct) {
  //   if (!curProduct || !curProduct.width) {
  //     this.state = {
  //       widthHeightValues: {
  //         width: 24,
  //         widthEighth: "0",
  //         height: 36,
  //         heightEighth: "0",
  //         blindType: "none",
  //       }
  //     };
  //   } else if (!curProduct || !curProduct.width && !curProduct.height && !curProduct.blindType) {
      
  //   } else {
  //     this.state = {
  //       widthHeightValues: {
  //         width: curProduct.width,
  //         widthEighth: curProduct.widthEighth,
  //         height: curProduct.height,
  //         heightEighth: curProduct.heightEighth,
  //         blindType: curProduct.blindType
  //       },
  //     };
  //   }
  // }

  update(productData, widthEighth, heightEighth) {
    this.commit(productData);

    return this.setState({
      widthHeightValues: productData,
    });
  }

  commit(productData) {
    const product = ReactionProduct.selectedProduct();
    const variant = ReactionProduct.selectedVariant();
    let parent;

    if (variant.ancestors[variant.ancestors.length - 1] === product._id) {
      parent = variant._id;
    } else {
      parent = variant.ancestors[variant.ancestors.length - 1];
    }

    const newVariant = Products.findOne(addNewVariantIfNotExist(parent, productData));
    console.info('RenderWidthHeightList - newVariant', addNewVariantIfNotExist(parent, productData), newVariant);
    this.props.methods.handleChildVariantClick(null, newVariant);
  }

  render() {
    // const product = ReactionProduct.selectedProduct();
    const { widthHeightValues } = this.state;
    console.info('RenderWidthHeightList - this.state: \n\n', this.state);

    return (<span>
      {[
        <WidthHeightOptionDescription key={"width-height"}/>,
        <div className="row variant-product-options" key={"childVariantList"}>
          <div> {[
            dimensionSelect.call(this, "width", widthHeightValues, WIDTH_HEIGHT_OPTIONS, EIGHTHS, (val, eighth) => {
              const productData = {
                width: val,
                widthEighth: eighth,
                height: this.state.widthHeightValues.height,
                heightEighth: this.state.widthHeightValues.heightEighth,
                blindType: this.state.widthHeightValues.blindType,
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
                blindType: this.state.widthHeightValues.blindType,
              };
              productData.price = softwoodProducts.find(findPrice, productData).price;
              this.update(productData);
            }),
          ]}</div>
        </div>,
        <BlindTypeDescription key={"blind-desc"} state={this.state}
          updateProduct={this.update.bind(this)}
        />
      ]}
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
let i = 1;
function priceSlotCheck(dimension, eighth) {
  i += 1;
  let dimensionOutput = dimension;

  if (dimension % 6 !== 0) {
    const subtract = dimension % 6;
    dimensionOutput = dimension - subtract + 6; // + 6 to round up to the next price
  }
  if (eighth !== 0) {
    dimensionOutput = dimensionOutput + 6;
    return dimensionOutput;
  }
  return dimensionOutput;
}

/**
  * findPrice()
  * @summary searches product-prices.js array for the price
  * matching the currently selected width/height.
  */
function findPrice(element) {
  let originWidth = this.width;
  let originHeight = this.height;
  const splitType = this.blindType;
  let splitValue = 1;

  switch (splitType) {
    case "2in1":
      splitValue = 2;
      break;
    case "3in1":
      splitValue = 3;
      break;
  }
  
  if (originWidth < 24) {
    originWidth = 24;
  }
  if (originHeight < 30) {
    originHeight = 30;
  }

  let splitWidth = Math.round(this.width / splitValue);

  if (splitWidth < 24) {
    splitWidth = originWidth;
    splitValue = 1;
  }

  const widthPrice = priceSlotCheck(splitWidth, parseInt(this.widthEighth, 10));
  const heightPrice = priceSlotCheck(originHeight, parseInt(this.heightEighth, 10));

  if (element.width === widthPrice && element.height === heightPrice) {
    console.log('price', widthPrice, heightPrice);
    element.price *= splitValue;
    return element.price;
  }
  return new Error("Failed to find price.");
}

// function findSplitValue(splitType) {
//   switch(splitType) {
//     case "2in1":
//       return 2;

//     case "3in1":
//       return 3;

//     default:
//       return 1;
// }

export function WidthHeightOptionDescription() {
  return (
    <div key={`variant-product-options-${Math.random()}`} className="row variant-product-options">
      <h2 style={{ width: "100%" }}>Select Size</h2>
      <p>
        If you selected <b>Inside Mount</b>, enter your window size.
        <br/>
        For <b>Outside Mount</b>, enter the product size you want.
      </p>
      <hr style={hrStyle}/>
    </div>
  );
}

export function BlindTypeDescription(props) {
  const {
    state,
    updateProduct
  } = props;

  return (
    <div key={`variant-product-options-${Math.random()}`} className="row variant-product-options">
      <hr style={hrStyle}/>
      <h2 style={{ width: "100%" }}>Select Blind Split</h2>
      <span className={"blinds" + "-selects"} key={`blinds-select-span-${Math.random()}`}>
        Split Blind
        <select
          className={"blinds" + "-select"}
          key={"blind" + "-select"}
          value={state.widthHeightValues.blindType}
          onChange={(e) => {
            const productData = {
              width: state.widthHeightValues.width,
              widthEighth: state.widthHeightValues.widthEighth,
              height: state.widthHeightValues.height,
              heightEighth: state.widthHeightValues.heightEighth,
              blindType: e.target.value
            };

            productData.price = softwoodProducts.find(findPrice, productData);
            console.log('price', softwoodProducts.find(findPrice,productData));
            updateProduct(productData);
          }}
        >
          { // loop to creation select options:
            SPLIT_OPTIONS.map((value, index) => {
              return (
                <option
                  className={"form-control"}
                  key={value}
                  value={value}
                >{value}</option>
                );
            })
          }
        </select>
      </span>
    </div>
  );
}

function WidthTitle() {
  return (
    <h3>Width<span>&harr;</span></h3>
  );
}

function HeightTitle() {
  return (
    <h3>Height<span>&#8597;</span></h3>
  );
}

function dimensionSelect(key, values, list, ethList, onChangeCallback) {
  const optionTitle = (key === "width") ? <WidthTitle/> : <HeightTitle/>;

  return (
    <span className={key + "-selects"} key={`${key}-select-span-${Math.random()}`}>
      {optionTitle}
      <select
        className={"form-control " + key + "-select"}
        key={`${key}-select-${Math.random()}`}
        value={values[key]}
        onChange={(e) => {
          console.log(key, e.target.value);
          onChangeCallback(parseInt(e.target.value, 10), values[key + "Eighth"]);
        }}
      >
        { // loop to creation select options:
          list.map((opVal, index) => {
            return (
              <option
                className={"form-control"}
                key={`${"".concat(key, index.toString(), opVal.toString())}-${Math.random()}`}
                value={opVal}
              >{opVal}</option>
            );
          })
        }
      </select>
      <select
        className={"form-control " + key + "-select-8th"}
        key={key + "-select-8th"}
        value={values[key + "Eighth"]}
        onChange={(e) => {
          console.log(key + "Eighth", e.target.value);
          onChangeCallback(values[key], parseInt(e.target.value, 10));
        }}
      >
        { // loop to create 8ths options:
          ethList.map((opVal, index) => {
            return (
              <option
                className={"form-control" + key + "-select-8th"}
                key={`${"".concat(key, index.toString(), opVal.toString())}-${Math.random()}`}
                value={opVal}
              >{opVal}</option>
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
  const blindType = element.blindType;
  const widthEighth = element.widthEighth;
  const heightEighth = element.heightEighth;
  const uniqueKey = width + " " + widthEighth + height + " " + heightEighth + "-" + blindType;

  return {
    _id: formatID(element),
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood " + uniqueKey,
    optionTitle: "Softwood " + uniqueKey,
    price: element.price,
    height: height,
    width: width,
    blindType: blindType,
    widthEighth: element.widthEighth,
    heightEighth: element.heightEighth,
    weight: 0,
    inventoryQuantity: 9,
    inventoryPolicy: false,
    metafields: [
      {
        key: "Height",
        value: element.height + " " + element.heightEighth,
      },
      {
        key: "Width",
        value: element.width + " " + element.widthEighth,
      },
    ]
  };
}

function addNewVariantIfNotExist(parent, varientConfig) {
  console.log('inside addNewVariantIfNotExist', varientConfig)
   try {
    return addNewVariant(parent, formatElement(varientConfig));
  } catch(error) {
    console.error("Variant already exists: ", error);
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
// After cleanBlinds(), variants are still in the DB
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

function formatID(element) {
  const width = element.width;
  const height = element.height;
  const widthEighth = element.widthEighth;
  const heightEighth = element.heightEighth;
  const blindType = element.blindType;
  const uniqueKey = width + "-" + widthEighth + "x" + height + "-" + heightEighth + "-" + blindType;
  return "Softwood" + uniqueKey + "-" + "Price" + element.price;
}

function addNewVariant(parentId, newVariant) {
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
    "From: /imports/plugins/custom/width-height-variant/client/render-list.js"
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

  // console.log(Products, ReactionProduct, Reaction);

  Products.insert(assembledVariant,
    (error, result) => {
      if (error) {
        console.error(error);
      }
      if (result) {
        console.info(
          `products/createVariant: created variant: ${
            newVariantId} for ${parentId}`
        );
      }
    }
  );
  
  // Reaction.Import.product({ 'ean': assembledVariant.newVariantId }, { 'price': assembledVariant.price }, { 'title': assembledVariant.title });

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
