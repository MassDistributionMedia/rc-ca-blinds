export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants"

// import width_heightVariantUploadForm from "./upload-template"
import React, { Component, PropTypes} from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import softwoodProducts from "../data/product-prices";
// import { addNewVariantIfNotExist } from "./add-new-variant";

// export { width_heightVariantUploadForm };
export default function renderWidthHeightList(list, props, methods) {
  if(!list.length) {
    return null;
  }
  let selectedWidth = "`";
  let selectedHeight;

  let indexedVariants = list.reduce(function(indexes, variant, index){
    let height = variant.height, width = variant.width;
    if(props.variantIsSelected(variant._id)){
      selectedWidth = width;
      selectedHeight = height;
    }
    let key = createKey(height, width);
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
    dimensionSelect("width", selectedWidth, widthHeightOptions, function(event) {
      let productData = {
        widthValue: event.target.value,
        heightValue: $(".height-select")[0].value,
        price: softwoodProducts.find(findPrice),
      };
      let variantId = ReactionProduct.selectedVariant()._id;
      console.log(Reaction, ReactionProduct, Products);
      debugger;
      addNewVariantIfNotExist(variantId, productData);
      updateVariant(selectedHeight, productData.widthValue, indexedVariants, methods);
    }),
    dimensionSelect("height", selectedHeight, widthHeightOptions, function(event) {
      let productData = {
        heightValue: event.target.value,
        widthValue: $(".width-select")[0].value,
        price: softwoodProducts.find(findPrice),
      };
      updateVariant(productData.heightValue, selectedWidth, indexedVariants, methods);
    }),
  ];
}

function findPrice(element) {
  if (element.width === this.widthValue && element.height === this.heightValue)
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
    let key = createKey(width, height);
    let variantIndex = indexes.variantIndex;
    if(!(key in variantIndex)){
      debugger;
      throw new Error("invalid key combination");
    }
    let variant = variantIndex[key];
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
  let optionTitle = null;
  if ( key === "width" ) {
    optionTitle = <WidthTitle/>
  } else {
    optionTitle = <HeightTitle/>
  }
  return (
    <span key={key+"select-span"}>
      {optionTitle}
      <select key={key + "-select"} className={"form-control " + key+"-select"} value={value} onChange={onChange}>
      { // loop to creation select options:
        list.map((opVal, index) => {
          return (
            <option
              className="form-control"
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

function formatElement(element) {
  var width = element.width, height = element.height;
  var unique_key = width + "x" + height;
  return {
    _id: "SoftwoodOption" + unique_key + "Price" + element.value,
    // inventoryQuantity: 9,
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood Option " + unique_key,
    optionTitle: "Softwood Option " + unique_key,
    price: element.value,
    height: height,
    width: width,
  };
}

function addNewVariantIfNotExist(variantId, varientConfig) {
  try {
    addNewVariant(variantId, formatElement(varientConfig));
  } catch(e) {
    console.log("Variant already exists: ", e);
  }
}

function addNewVariant(parentId, newVariant, cb){

    const newVariantId = newVariant._id || Random.id();
    // get parent ancestors to build new ancestors array
    const { ancestors } = Products.findOne(parentId);

    Array.isArray(ancestors) && ancestors.push(parentId);
    console.log(
      `addNewVariant(${parentId}, newVariant, cb) \n`,
      `From: /imports/plugins/custom/width-height-variant/server/startup.js`
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

    // if we are inserting child variant to top-level variant, we need to remove
    // all top-level's variant inventory records and flush it's quantity,
    // because it will be hold sum of all it descendants quantities.
    if (ancestors.length === 2) {
      flushQuantity(parentId);
    }

    Products.insert(assembledVariant,
      (error, result) => {
        if(cb) cb(error, result);
        if (result) {
          console.log(
            `products/createVariant: created variant: ${
              newVariantId} for ${parentId}`
          );
        }
      }
    );

    return newVariantId;
}

function flushQuantity(id) {
  const variant = Products.findOne(id);
  // if variant already have descendants, quantity should be 0, and we don't
  // need to do all next actions
  if (variant.inventoryQuantity === 0) {
    return 1; // let them think that we have one successful operation here
  }

  return Products.update({
    _id: id,
  }, {
    $set: {
      inventoryQuantity: 0,
    }
  }, {
    selector: {
      type: "variant",
    }
  });
}
