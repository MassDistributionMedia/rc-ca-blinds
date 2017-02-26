export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants"

import width_heightVariantUploadForm from "./upload-template"

import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";


export { width_heightVariantUploadForm };
export default function renderWidthHeightList(list, props, methods) {
  if(!list.length) {
    return null;
  }
  var selectedWidth = "`";
  var selectedHeight;

  var indexedVariants = list.reduce(function(indexes, variant, index){
    var height = variant.height, width = variant.width;
    if(props.variantIsSelected(variant._id)){
      selectedWidth = width;
      selectedHeight = height;
    }
    var key = createKey(height, width);
    if(key in indexes.variantIndex) {
      throw new Error("a duplicate index exists");
    }
    indexes.variantIndex[key] = variant;
    indexes.widthList.add(width);
    indexes.heightList.add(height);
    return indexes;
  }, {
    variantIndex: {},
    widthList: new Set(),
    heightList: new Set(),
  });

  const heightList = Array.from(
    indexedVariants.heightList.values()
  );
  heightList.sort((a, b) => {return a - b});
  const widthList = Array.from(
    indexedVariants.widthList.values()
  );
  widthList.sort((a, b) => {return a - b});
  if(selectedWidth === "`") {
    selectedWidth = widthList[0];
    selectedHeight = heightList[0];
  }

  return [
    dimensionSelect("width", selectedWidth, widthList, function(event) {
      let value = event.target.value;
      updateVariant(selectedHeight, value, indexedVariants, methods);
    }),
    dimensionSelect("height", selectedHeight, heightList, function(event) {
      let value = event.target.value;
      updateVariant(value, selectedWidth, indexedVariants, methods);
    }),
  ];

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

function updateVariant(width, height, indexes, methods) {
    var key = createKey(width, height);
    var variantIndex = indexes.variantIndex;
    if(!(key in variantIndex)){
      debugger;
      throw new Error("invalid key combination");
    }
    var variant = variantIndex[key];
    methods.handleChildleVariantClick(null, variant)
}

function createKey(width, height) {
    return width + "x" + height;
}

function WidthTitle() {
  return (
    <h3>Width &harr;</h3>
  );
}
function HeightTitle() {
  return (
    <h3>Height &#8597;</h3>
  );
}

function dimensionSelect(key, value, list, onChange){
  if ( Reaction.hasPermission('guest') ) {
  let optionTitle = null;
  if ( key === "width" ) {
    optionTitle = <WidthTitle/>
  } else {
    optionTitle = <HeightTitle/>
  }
  return (
    <span key={key+"select-span"}>
      {optionTitle}
      <select key={key + "-select"} className="form-control" value={value} onChange={onChange}> {
        list.map((opVal, index) => {
          return (
            <option
              className="form-control"
              key={"".concat(key, index.toString(), opVal.toString())}
              value={opVal}
            >{opVal}</option>
            )
        })
      }</select>
    </span>
  );
  } // end if Reaction.hasPermission('guest')
}
