export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants"

import width_heightVariantUploadForm from "./upload-template"

import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";


export { width_heightVariantUploadForm };
export default function renderWidthHeightList(list, props, methods){
  if(!list.length) {
    return null;
  }
  console.log("compiling");
  var selectedWidth = list[0].width;
  var selectedHeight = list[0].height;
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
    if(!indexes.widthList.has(width)) {
      indexes.widthList.add(miniRender("width", index, width));
    }
    if(!indexes.heightList.has(height)) {
      indexes.heightList.add(miniRender("height", index, height));
    }
    return indexes;
  }, {
    variantIndex: {},
    widthList: new Set(),
    heightList: new Set(),
  });
  
  const heightList = Array.from(
    indexedVariants.heightList.values()
  );
  const widthList = Array.from(
    indexedVariants.widthList.values()
  );

  return [
    dimensionSelect(selectedWidth, widthList, function(event) {
      var value = event.target.value;
      updateVariant(selectedHeight, value, indexes, methods);
    }),
    dimensionSelect(selectedheight, heightList, function(event) {
      var value = event.target.value;
      updateVariant(value, selectedWidth, indexes, methods);
    }),
  ]

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

function miniRender(uniqueName, index, dimensionValue) {
    return (
      <option
        className="form-control"
        key={"".concat(uniqueName, index.toString(), dimensionValue.toString())}
        value={dimensionValue}
      >
        {dimensionValue}
      </option>
    );
}


function dimensionSelect(value, list, onChange){
  return <select className="form-group" value={value} onChange={onChange} >{
    list
  }</select>;
}

