import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { ReactionProduct } from "/lib/api";
import { Media, Products, Revisions, Tags } from "/lib/collections";
import { Packages, Shops } from "/lib/collections";
import { Template } from "meteor/templating";

import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
import products from "../data/product-seed";

function convertStringToProducts(text){
  return JSON.parse(text);
}

// function handleTextInput(productId, text){
//   emptyOldVariants(productId);
//   addNewVariants(productId, convertStringToProducts(text));
// }

function emptyOldVariants(productId) {
  var query = {
    ancestors: { $in: [productId] },
    type: "variant",
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
  };
  var oldProducts = Products.find(query).fetch();
  console.log("old products:", oldProducts.length)
  Products.remove(query);
  var eh = Products.find(query).fetch();
  console.log("new length:", eh.length);

  // oldProducts.forEach(function(p){
  //   Products.insert(p);
  // })

  // oldDeleteVariants(productId);
  // var deleted = deleteVariants(productId, WIDTH_HEIGHT_VARIANT_TYPE);
}

function formatElement(element) {
  var width = element.width, height = element.height;
  var unique_key = width + "x" + height;
  return {
    _id: "SoftwoodOption" + unique_key + "Price" + element.value,
    inventoryQuantity: 9,
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood Option " + unique_key,
    optionTitle: "Softwood Option " + unique_key,
    price: element.value,
    height: height,
    width: width,
  };
}

function addNewVariantsIfNotExist(productId, varientConfig) {
  try {
    // First, create the parent/top-level-variant with the second arg in `let nextParentID`
    // Then, in `nextParentID`s callback, create the child variant(s)
    let nextParentID = addNewVariant(productId, {
      _id: "SoftwoodOptionParent",
      title: "Softwood: Width and Height",
      variantType: WIDTH_HEIGHT_VARIANT_TYPE,
      optionTitle: "Softwood Option: Width and Height",
    }, function(err){
      console.log(nextParentID);
      if(!err && nextParentID) {
        addNewVariants(nextParentID, varientConfig);
      }
    }); // end nextParentID
  } catch(e) {
    console.log("already exists: ", e);
  }
}

function addNewVariants(productId, varientConfig) {
  varientConfig.forEach((element, index) => {
    addNewVariant(productId, formatElement(element));
  });
}

/* PSUEDO CODE - User has variant? Don't delete it.

  on("removeFromCart", function(variant, userID) {
    if(variant.type !== OUR_DESIRED_VARIANT_TYPE) {
      return;
    }
    findVariantWhere({
        parent: selectedParent,
        dependentUsers: {
          $has: {
            user: userID,
            context: "in-cart", // context will be "temporary" | "in cart"
          }
        }
      });
      var toDelet = [];
      var toUpdate = [];
      temps.forEach(function(variant) {
        if(variant.dependentUsers.length === 1 ){
          toDelet.push(variant);
        } else {
          variant.dependentUsers.splice(variant.indexOf(userID), 1);
          toUpdate.push(variant);
        }
      });
      deleteVariants(toDele);
      updateVariants(toUpdate);

    })

*/

Meteor.startup(function () {
  
  console.log("\n\n\n\n\n\n\n\n\n\n\n Height Width Custom Startup!!!! \n\n\n\n\n\n\n\n\n\n\n")

  Meteor.methods({
    'clearBlinds'({ selectedParent, selectedVariantConfig,  userID }) {
      removeOldTemporaryVarient(userID, "temporary", selectedParent);
      var tempVariant = findOrCreateTemporaryVariant(
        selectedParent, selectedVariantConfig
      );
      setVariantToUsersTemporaryVariant(userID, tempVariant);
    },
    'width-height-variant.set-variants'({ productId, variantConfigFile }) {
      console.log("set variant: ", variantConfigFile);
      const variantConfig = JSON.parse(variantConfigFile);
      emptyOldVariants(productId);
      addNewVariants(productId, variantConfig);
    },
    "width-height-variant.is-valid-variant"({ productId, variantConfig}) {

    }
  });

    /**
     * heightWidth onRendered
     */
  // if(ReactionProduct.get("productId"))

//   return this.autorun(() => {
//   });


  // const existingProducts = Products.find({}, {limit: 1}).fetch();
  // console.log(existingProducts);
  // let hackyProductId = "BCTMZ6HTxFSppJESk";
  // let hackyPrices = products;
  // emptyOldVariants(hackyProductId);
  /*
    db.Products.remove({ ancestors: { $in: ["BCTMZ6HTxFSppJESk"] }, type: "variant", $or :[ {variantType: "blindsHeightWidth"}, { width: { "$exists": true }, height: { "$exists": true }, } ]})
  */
  // addNewVariantsIfNotExist(hackyProductId, hackyPrices);

});

function formatElement(element) {
  const width = element.width;
  const height = element.height;
  const widthEighth = element.widthEighth + "8th";
  const heightEighth = element.heightEighth + '8th';
  const unique_key = width + "-" + widthEighth + "x" + height + "-" + heightEighth;
  return {
    _id: "Softwood" + unique_key + "Price" + element.price,
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood " + unique_key,
    optionTitle: "Softwood " + unique_key,
    price: element.price,
    height: height,
    width: width,
    widthEighth: element.widthEighth,
    heightEighth: element.heightEighth,
    weight: 0,
    inventoryQuantity: 9,
    inventoryPolicy: false,
  };
}

function removeVarient(userID, context, selectedParent) {
  var temps = findVariantWhere({
    parent: selectedParent,
    dependentUsers: {
      $has: {
        user: userID,
        context: context, // context will be "temporary" | "in cart"
      }
    }
  });
  var toDelete = [];
  var toUpdate = [];
  temps.forEach(function(variant) {
    if(variant.dependentUsers.length === 1 ){
      return toDelete.push(variant);
    }
    for(var i = 0; i < variant.dependentUsers.length; i++){
      if(variant.dependentUsers[i].context !== context){
        continue;
      }
      if(variant.dependentUsers[i].user !== userID){
        continue;
      }
      variant.dependentUsers.splice(i, 1);
      return toUpdate.push(variant);
    }
    console.error("missing user");
  });
  deleteVariants(toDelete);
  updateVariants(toUpdate);
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


// const toDenormalize = [
//   "price",
//   "inventoryQuantity",
//   "lowInventoryWarningThreshold",
//   "inventoryPolicy",
//   "inventoryManagement",
// ];


// function getVariants(id, type){
//   return Products.find({
//     ancestors: { $in: [id] },
//     type: "variant",
//     variantType: type,
//   }).map(getPublishedOrRevision);
// }

function deleteVariants(id, type) {
  var query = {
    ancestors: { $in: [id] },
    type: "variant",
    variantType: type,
  };
  var ret = Products.find(query).map(getPublishedOrRevision);
  console.log("new delete length: ", ret.length);
  if(ret.length === 0) return [];
  console.log(query);
  console.log(Products.remove(query, function(err){
    console.log("delete error: ", err);
  }));
  return ret;
}
function oldDeleteVariants(id) {
  var query = {
    ancestors: { $in: [id] },
    type: "variant",
    width: { $exists: true },
    height: { $exists: true },
  };

  var ret = Products.find(query).map(getPublishedOrRevision);
  console.log("old delete length: ", ret.length);
  if(ret.length === 0) return [];
  console.log(query);
  console.log(Products.remove(query, function(err){
    console.log("old delete error: ", err);
  }));
  return ret;
}


function deleteVariant(variantId){
    const selector = {
      $or: [{
        _id: variantId,
      }, {
        ancestors: {
          $in: [variantId],
        }
      }]
    };
    const toDelete = Products.find(selector).fetch();
    // out if nothing to delete
    if (!Array.isArray(toDelete) || toDelete.length === 0) return false;

    const deleted = Products.remove(selector);

    // after variant were removed from product, we need to recalculate all
    // denormalized fields
    const productId = toDelete[0].ancestors[0];
    toDenormalize.forEach(field => denormalize(productId, field));

    return typeof deleted === "number" && deleted > 0;
}

// createVariant(product_Id);
// var heightWidthParnetId = get(ID) // from returned variant ID: https://github.com/reactioncommerce/reaction/blob/90ce4bf67f084e0ec39bf7eaf2c80b5bc0ed902f/server/methods/catalog.js#L444
// loop -> createVariant(heightWidthParnetId);

// function denormalize(id, field) {
//   const doc = Products.findOne(id);
//   let variants;
//   if (doc.type === "simple") {
//     variants = Catalog.getTopVariants(id);
//   } else if (doc.type === "variant" && doc.ancestors.length === 1) {
//     variants = getVariants(id);
//   }
//   const update = {};

//   switch (field) {
//     case "inventoryPolicy":
//     case "inventoryQuantity":
//     case "inventoryManagement":
//       Object.assign(update, {
//         isSoldOut: isSoldOut(variants),
//         isLowQuantity: isLowQuantity(variants),
//         isBackorder: isBackorder(variants),
//       });
//       break;
//     case "lowInventoryWarningThreshold":
//       Object.assign(update, {
//         isLowQuantity: isLowQuantity(variants)
//       });
//       break;
//     default: // "price" is object with range, min, max
//       const priceObject = Catalog.getProductPriceRange(id);
//       Object.assign(update, {
//         price: priceObject,
//       });
//   }
//   Products.update(id, {
//     $set: update,
//   }, {
//     selector: {
//       type: "simple",
//     }
//   });
// }

// function getPublishedOrRevision(product) {
//   if (product.__revisions && product.__revisions.length) {
//     const cleanProduct = Object.assign({}, product);
//     delete cleanProduct.__revisions;

//     return Object.assign({},
//       product.__revisions[0].documentData,
//       {
//         __published: cleanProduct,
//         __draft: product.__revisions[0]
//       }
//     );
//   }
//   return product;
// }

export { emptyOldVariants };