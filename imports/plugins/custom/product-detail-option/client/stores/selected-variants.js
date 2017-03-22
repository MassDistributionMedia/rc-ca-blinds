
var currentProduct;
var variantsToSet;
var variantMap;

module.exports.setProduct = function(nextProduct){
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
}

module.exports.setVariant = function(parentVariant, childVariant){
  if(!variantsToSet.some(function(varient){
    return variant._id === parentVariant._id;
  })){
    throw new Error("This variant does not have valid ancestry");
  }
  variantMap[parentVariant._id] = childVariant._id;

}

module.exports.composeNewVariant = function(){
  var newVariant = variantsToSet.reduce(function(netVariant, reqVarient){
    if(!(reqVarient._id in variantMap)){
      throw new Error("A variant option is missing");
    }
    var setVariant = Products.findOne(variantMap[reqVarient._id]);
    var values = extractValuesFromVariant(setVariant);
    var metafields = valuesToMetaFields(value);

    netVariant.values = netVariant.values.concat(value);
    netVariant.metafields = netVariant.metafields.concat(metafields);
    netVariant.price += setVariant.price;
    netVariant._id += hash(reqVarient._id).toString(32) + hash(setVariant).toString(32);
    return netVariant;
  }, { _id: "", values: [], metafields: [], price: 0 });

  newVariant.title = "Custom " + currentProduct.title;

  newVariant.type = "make-shift";

  addNewVariant(currentProduct._id, newVariant);

}

const MULTIPLIER = 37;
function hash(str){
  return str.split('').reduce(function(h, char){
    return MULTIPLIER * h + char.charCodeAt(0);
  }, 0);
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
