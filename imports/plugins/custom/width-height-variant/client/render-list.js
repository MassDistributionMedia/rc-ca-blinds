import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import softwoodProducts from "../data/product-prices";
import addNewVariantIfNotExist from "./add-new-variant";

export default function renderWidthHeightList(list, props, methods, selectedValues) {
  if (!list.length) {
    return null;
  }

  if (!selectedValues.width) {
    selectedValues.width = 24;
  }
  if (!selectedValues.height) {
    selectedValues.height = 30;
  }

  let indexedVariants = list.reduce(function(indexes, variant, index){
    let height = variant.height, width = variant.width;
    if (props.variantIsSelected(variant._id)) {
      selectedValues.width = width;
      selectedValues.height = height;
    }
  });

  return [
    dimensionSelect("width", selectedValues.width, widthHeightOptions, EIGHTHS, function(event) {
    const productData = {
      width: parseInt(event.target.value),
      height: parseInt($(".height-select")[0].value),
      widthEighth: parseInt($(".width-select-8th")[0].value),
      heightEighth: parseInt($(".height-select-8th")[0].value),
    };
    productData.price = softwoodProducts.find(findPrice, productData).price;
    const variantId = ReactionProduct.selectedVariant()._id;
    const newVariantId = Products.findOne(addNewVariantIfNotExist(variantId, productData));
    console.log(newVariantId);
    debugger;
    methods.handleChildleVariantClick(null, newVariantId);

    return props.widthHeightValues.width = productData.width;
  }),
    dimensionSelect("height", selectedValues.height, widthHeightOptions, EIGHTHS, function(event) {
      const productData = {
        width: parseInt($(".width-select")[0].value),
        height: parseInt(event.target.value),
        widthEighth: parseInt($(".width-select-8th")[0].value),
        heightEighth: parseInt($(".height-select-8th")[0].value),
      };
      productData.price = softwoodProducts.find(findPrice, productData).price;
      const variantId = ReactionProduct.selectedVariant()._id;
      const newVariantId = Products.findOne(addNewVariantIfNotExist(variantId, productData));
      methods.handleChildleVariantClick(null, newVariantId);

      return props.widthHeightValues.height = productData.height;
    }),
  ];
} // end renderWidthHeightList()

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
  if ( this.width < 24 ) {
    this.width = 24;
  }
  if ( this.height < 30 ) {
    this.height = 30;
  }
  let widthPrice = priceSlotCheck(this.width, this.widthEighth);
  let heightPrice = priceSlotCheck(this.height, this.heightEighth);
  if (element.width === widthPrice && element.height === heightPrice)
    return element;
}

const widthHeightOptions = selectOptions();
function selectOptions() {
  let diameterOptions = [];
  for(let i=9;i<97;i++){
    diameterOptions.push(i);
  }
  return diameterOptions;
};

const EIGHTHS = [
  0, 1, 2, 3, 4, 5, 6, 7,
].map(function(i) { return i + "/8"; });

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

// function updateVariant(width, height, indexes, methods) {
//   let key = createKey(width, height);
//   let variantIndex = indexes.variantIndex;
//   if(!(key in variantIndex)){
//     console.log(variantIndex, key);
//     debugger;
//     throw new Error("invalid key combination");
//   }
//   let variant = variantIndex[key];
//   methods.handleChildleVariantClick(null, variant)
// }

// function createKey(width, height) {
//   return width + "x" + height;
// }

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

function dimensionSelect(key, value, list, ethList, onChange){
  let optionTitle = null;
  if ( key === "width" ) {
    optionTitle = <WidthTitle/>
  } else {
    optionTitle = <HeightTitle/>
  }
  return (
    <span className={key+"-selects"} key={key+"select-span"}>
      {optionTitle}
      <select className={"form-control " + key + "-select"}
              key={key + "-select"}
              value={value}
              onChange={onChange}>
      { // loop to creation select options:
        list.map((opVal, index) => {
          return (
            <option
              className={"form-control"}
              key={"".concat(key, index.toString(), opVal.toString())}
              value={opVal}
            >{opVal}</option>
            )
        })
      }
      </select>
      <select className={"form-control " + key + "-select-8th"}
              key={key + "-select-8th"}
              onChange={onChange}>
        { // loop to create 8ths options:
          ethList.map((opVal, index) => {
            return (
            <option
              className={"form-control" + key + "-select-8th"}
              key={"".concat(key, index.toString(), opVal.toString())}
              value={opVal}
              >{opVal}</option>
              )
          })
        }
      </select>
    </span>
  );
}
