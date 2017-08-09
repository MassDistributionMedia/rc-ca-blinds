import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";

var variantMap;
var variantsToSet;
var currentProduct;
var listeners = [];
var productObject = {};
var variantOptions = [];

export function setProduct(nextProduct){
  if(currentProduct && currentProduct._id === nextProduct._id){
    return;
  }
  currentProduct = nextProduct;
  variantsToSet = ReactionProduct.getVariants(nextProduct._id).filter(function(variant){
    return variant.variantType !== "make-shift";
  });
  variantsToSet = variantsToSet.sort(function(a, b){
    return a._id - b._id;
  });
  variantMap = {};
  listeners = [];
}

export function handelingProduct(){
  return !!currentProduct;
}

export function onUpdate(fn){
  listeners.push(fn);
}
export function offUpdate(fn){
  var i = listeners.indexOf(fn);
  i > -1 && listeners.splice(i, 1);
}

export function setVariant(childVariant){
  var parentVariantId = childVariant.ancestors[childVariant.ancestors.length -1];
  if(parentVariantId === currentProduct._id){
    return;
  }
  if(!variantsToSet.some((variant) =>
    variant._id === parentVariantId
  )){
    throw new Error("This variant does not have valid ancestry");
  }
  variantMap[parentVariantId] = childVariant._id;

  listeners.forEach((function(fn){
    fn();
  }));

  setProductObject();
  setChildVariants();
}

export function setProductObject() {
  for(let index in variantsToSet) {
    if(variantsToSet[index].ancestors.length === 1) {
      let key = variantsToSet[index].title;

      productObject[key] = [];
      variantOptions.push(variantsToSet[index]);
    }
  }
}

export function setChildVariants() {
  for(let index in variantsToSet) {
    if(variantsToSet[index].ancestors.length >= 2) {
      let ancestors = variantsToSet[index].ancestors;

      for(let i in ancestors) {
        let parentKey = findParentVariant(ancestors[i]);

        parentKey ? productObject[parentKey].push(variantsToSet[index]): null;
      }
    }
  }
}

export function findParentVariant(id) {
  for(let index in variantOptions) {
    if(variantOptions[index]._id === id) {
      return variantOptions[index].title;
    }
  }
  return null;
}

export function retrieveCurrentPrice(){
  if(!currentProduct){
    return 0;
  }
  return Object.keys(variantMap).reduce(function(price, parentID){
    var setVariant = Products.findOne(variantMap[parentID]);
    if(!setVariant){
      throw new Error("This variant does not exist");
    }
    return p + setVariant.price;
  }, 0);
}

export function retrieveMetaValues(){
  console.log('called retrieveMetaValues');
  if(!currentProduct){
    return [];
  }

  return Object.keys(variantMap).reduce(function(netArray, parentID){
    var reqVariant = Products.findOne(parentID);
    var setVariant = Products.findOne(variantMap[parentID]);
    if(!setVariant){
      throw new Error("This variant does not exist");
    }
    var values = extractValuesFromVariant(setVariant, reqVariant);
    var metafields = valuesToMetaFields(values);
    // console.log('values', values);
    // console.log('metafields', metafields);

    return netArray.concat(metafields);
  }, []);
}

export function composeNewVariant(){
  /* Check if all the variants options are selected or not */
  // let variantMapLength = _.size(variantMap);
  // if(variantMapLength < variantOptions.length) {
  //   throw new Error('A variant option is missing. Please select all the variants');
  // }

  var netVariant = {
    _id: '',
    price: 0,
    values: [],
    metafields: [],
    isProductBundle: true,
  };

  for(let reqVariant in variantMap) {
    let parentVariant = Products.findOne(reqVariant);
    let setVariant = Products.findOne(variantMap[reqVariant]);

    if(!setVariant) {
      throw new Error("This variant does not exist");
    }

    var values = extractValuesFromVariant(setVariant, parentVariant);
    var metafields = valuesToMetaFields(values);

    netVariant.price += setVariant.price;
    netVariant.values = netVariant.values.concat(values);
    netVariant.metafields = netVariant.metafields.concat(metafields);
    netVariant._id += hash(parentVariant._id).toString(32) + hash(setVariant._id).toString(32);
  }

  netVariant.type = "variant";
  netVariant.title = "Custom Bundled " + currentProduct.title;

  return addNewVariant(currentProduct._id, netVariant);
}

const MULTIPLIER = 37;
function hash(str){
  return str.split('').reduce(function(h, char) {
    return MULTIPLIER * h + char.charCodeAt(0);
  }, 0);
}

function extractValuesFromVariant(variant, parent) {
  switch(variant.variantType) {
    case "variant":
      return {
        [parent.title]: variant.optionTitle
      };
    case "blindsHeightWidth":
      return {
        Width: variant.width + " " + variant.widthEighth  + "/8",
        Height: variant.height + " " + variant.heightEighth  + "/8",
        BlindType: variant.blindType,
      }
    default:
      return {
        [parent.title]: variant.optionTitle
      };
  }
}

function valuesToMetaFields(values){
  return Object.keys(values).reduce(function(netArray, key) {
    var newObj = {};
    newObj.key = key;
    newObj.value = values[key];
    return netArray.concat([ newObj ]);
  }, []);
}

function addNewVariant(parentId, newVariant){

  const newVariantId = newVariant._id;
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
    isVisible: true
  });

  if (!newVariant) {
    Object.assign(assembledVariant, {
      title: "",
      price: 0.00,
    });
  }

  Products.insert(assembledVariant,
    (error, result) => {
      if(error) {
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

  return newVariant;
}
