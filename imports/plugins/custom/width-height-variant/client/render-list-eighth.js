export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants"

import constructKey, { formatDim } from "../shared/construct-key";
import width_heightVariantUploadForm from "./upload-template"

import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";

const EIGHTHS = [
  0, 1, 2, 3, 4, 5, 6, 7,
].map(function(i) { return i + "/8"; });

export { width_heightVariantUploadForm };
export default function renderWidthHeightList(list, props, methods){
  if(!list.length) {
    return null;
  }
  var selectedWidth = "`";
  var selectedHeight;
  var selectedWFrac
  var selectedHFrac
  var indexedVariants = list.reduce(function(indexes, variant, index){
    var { width, height, wfrac, hfrac } = variant;
    if(props.variantIsSelected(variant._id)){
      selectedWidth = width;
      selectedWFrac = wfrac;
      selectedHeight = height;
      selectedHFrac = hfrac;
    }
    var key = constructKey(width, wfrac, height, hfrac);
    if(key in indexes.variantIndex) {
      throw new Error("a duplicate index exists");
    }
    indexes.variantIndex[key] = variant;
    if(wfrac > 0 || hfrac > 0){
      return indexes;
    }
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
    selectedWFrac = 0;
    selectedHeight = heightList[0];
    selectedHFrac = 0;
  }

  return [
    dimensionSelect("width", selectedWidth, widthList, function(event) {
      var value = event.target.value;
      updateVariant(
        value,
        selectedWFrac,
        selectedHeight,
        selectedHFrac,
        indexedVariants, methods
      );
    }),
    dimensionSelect("hwidth", selectedWFrac + "/8", EIGHTHS, function(event) {
      var value = event.target.value;
      updateVariant(
        selectedWidth,
        value,
        selectedHeight,
        selectedHFrac,
        indexedVariants, methods
      );
      updateVariant(selectedHeight, value, indexedVariants, methods);
    }),
    dimensionSelect("height", selectedHeight, heightList, function(event) {
      var value = event.target.value;
      updateVariant(
        selectedWidth,
        selectedWFrac,
        value,
        selectedHFrac,
        indexedVariants, methods
      );
    }),
    dimensionSelect("height", selectedHFrac + "/8", EIGHTHS, function(event) {
      var value = event.target.value;
      updateVariant(
        selectedWidth,
        selectedWFrac,
        selectedHeight,
        value,
        indexedVariants, methods
      );
    }),
  ];

}


function updateVariant(width, wfrac, height, hfrac, indexes, methods) {
    var key = constructKey(width, wfrac, height, hfrac);
    var variantIndex = indexes.variantIndex;
    if(!(key in variantIndex)){
      debugger;
      throw new Error("invalid key combination");
    }
    var variant = variantIndex[key];
    methods.handleChildleVariantClick(null, variant);
}

function dimensionSelect(key, value, list, onChange){
  return (
    <select
      key={key + "-select"}
      className="form-group"
      value={value}
      onChange={onChange}
    >{
      list.map((opVal, index)=>{
        return (
          <option
            className="form-control"
            key={"".concat(key, index.toString())}
            value={opVal.value}
          >{opVal.display}</option>
          )
      })
    }</select>
  );
}

