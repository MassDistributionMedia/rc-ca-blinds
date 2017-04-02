import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";

var currentProduct;
var variantsToSet;
var variantMap;
var listeners = [];

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
    return netArray.concat(metafields);
  }, []);
}

export function composeNewVariant(){
  console.log('variantMap', variantMap, variantsToSet);
  var newVariantConfig = variantsToSet.reduce(function(netVariant, reqVariant){
    console.log('reqVariant', reqVariant._id);
    if(!(reqVariant._id in variantMap)){
      throw new Error("A variant option is missing");
    }

    var setVariant = Products.findOne(variantMap[reqVariant._id]);
    if(!setVariant){
      throw new Error("This variant does not exist");
    }

    var values = extractValuesFromVariant(setVariant, reqVariant);
    var metafields = valuesToMetaFields(values);

    netVariant.values = Object.assign({}, values, netVariant.values);
    netVariant.metafields = netVariant.metafields.concat(metafields);
    netVariant.price += setVariant.price;
    netVariant._id += hash(reqVariant._id).toString(32) + hash(setVariant._id).toString(32);
    return netVariant;
  }, { _id: "", values: [], metafields: [], price: 0 });

  newVariantConfig.title = "Custom " + currentProduct.title;

  newVariantConfig.type = "make-shift";

  return addNewVariant(currentProduct._id, newVariantConfig);
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
    case "Height & Width":
      return {
        Width: variant.width + " " + variant.widthEighth  + "/8",
        Height: variant.height + " " + variant.heightEighth  + "/8",
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

function addNewVariant(parentId, newVariant) {

  if (Products.findOne(newVariant._id)) {
    console.log("Variant already exists: ", newVariant._id);
    return newVariant._id;
  }

  const newVariantId = newVariant._id;
  // get parent ancestors to build new ancestors array
  const product = Products.findOne(parentId);
  const { ancestors } = product;

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

  return newVariantId;
}
