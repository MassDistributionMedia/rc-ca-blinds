import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { ReactionProduct } from "/lib/api";
import { ProdPrices } from "/lib/collections/prodPrices";
// import { Products, Media } from "/lib/collections";
import { Media, Products, Revisions, Tags } from "/lib/collections";
import { Packages, Shops } from "/lib/collections";
import { Template } from "meteor/templating";

import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
import constructKey, { formatDim } from "../shared/construct-key";
import { spawn, execSync } from "child_process";

var hwRan = false;
function heightWidthOptions() {
  if(hwRan) return;
  hwRan = true;
  var oldVariants = ReactionProduct.getTopVariants();
  var toRemove = oldVariants;
  toRemove.forEach(function(item) {
    deleteVariant(item._id);
  });
}

function emptyOldVariants(productId) {
  var query = {
    ancestors: { $in: [productId] },
    type: "variant",
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
  };
  var oldProducts = Products.find(query).fetch();
  console.log("old products:", oldProducts.length)
  Products.remove(query);
  Products.remove(query);
  var eh = Products.find(query).fetch();
  console.log("new length:", eh.length);

  // oldProducts.forEach(function(p){
  //   Products.insert(p);
  // })

  // oldDeleteVariants(productId);
  // var deleted = deleteVariants(productId, WIDTH_HEIGHT_VARIANT_TYPE);
}

function addNewVariantsIfNotExist(productId, varientConfigs) {
  try{
    var nextParentID = addNewVariant(productId, {
      _id: "SoftwoodOptionParent",
      title: "Softwood: Width and Height",
      variantType: WIDTH_HEIGHT_VARIANT_TYPE,
      optionTitle: "Softwood Option: Width and Height",
    }, function(err){
      console.log(nextParentID);
      if(!err && nextParentID) {
        addNewVariants(nextParentID, varientConfigs);
      }
    })
  }catch(e){
    console.log("already exists:", e);
  }
}

function addNewVariants(productId, variantConfigs) {
  var widthIndexed = new Map();
  var heightIndexed = new Map();
  variantConfigs.forEach(function(a) {
    if(!widthIndexed.has(a.width)) {
      widthIndexed.set(a.width, new Map());
    }
    widthIndexed.get(a.width).set(a.height, a);

    if(!heightIndexed.has(a.height)) {
      heightIndexed.set(a.height, new Map());
    }
    heightIndexed.get(a.height).set(a.width, a);
  });

  var sortedWidths = Array.from(widthIndexed.keys()).sort(function(a, b){ return a - b; });
  var sortedHeights = Array.from(heightIndexed.keys()).sort(function(a, b){ return a - b; });
  sortedWidths.forEach(function(width, iw){
    sortedHeights.forEach(function(height, ih){
      for(var x = 0; x < 8; x++) {
        for(var y = 0; y < 8; y++) {
          var config;
          if(x === 0 && y === 0) {
            config = heightIndexed.get(height).get(width);
          }else if(x === 0) {
            config = heightIndexed.get(sortedHeights[ih - 1]).get(width)
          }else if(y === 0) {
            config = widthIndexed.get(sortedWidths[iw - 1]).get(height)
          }else {
            config = widthIndexed.get(sortedWidths[iw - 1]).get(sortedHeights[ih - 1])
          }
          addNewVariant(
            productId, formatElement(config, x, y)
          );

          if(ih === 0) break;
        }
        if(iw === 0) break;
      }
    });
  });
}

function formatElement(element, x, y) {
    var width = element.width, height = element.height;
    var unique_key = constructKey(width, x, height, y);
    return {
      _id: "SoftwoodOptionW"+width+"H"+height+"X"+x+"Y"+y,
      inventoryQuantity: 9,
      variantType: WIDTH_HEIGHT_VARIANT_TYPE,
      title: "Softwood Option " + unique_key,
      optionTitle: "Softwood Option " + unique_key,
      price: element.value,
      width: width,
      w_frac: x,
      height: height,
      h_frac: y
    };
}


Meteor.startup(function () {

  Meteor.methods({
    'width-height-variant.set-variants'({ productId, variantConfigFile }) {
      console.log("set variant");
      var variantConfigs = JSON.parse(variantConfigFile);
      emptyOldVariants(productId);
      addNewVariants(productId, varientConfigs);
    },
    "width-height-variant.is-valid-variant"({ productId, variantConfig}) {

    }
  });

    /**
     * heightWidth onRendered
     */
  // if(ReactionProduct.get("productId"))
    // debugger;

//   return this.autorun(() => {
//   });


  // const existingProducts = Products.find({}, {limit: 1}).fetch();
  // console.log(existingProducts);
  var hackyProductId = "BCTMZ6HTxFSppJESk";
  var hackyPrices = ProdPrices;
  // emptyOldVariants(hackyProductId);
  /*
    db.Products.remove({ ancestors: { $in: ["BCTMZ6HTxFSppJESk"] }, type: "variant", $or :[ {variantType: "Height & Width"}, { width: { "$exists": true }, height: { "$exists": true }, } ]})
  */
  addNewVariantsIfNotExist(hackyProductId, hackyPrices);

});

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
    const {
      ancestors,
    } = Products.findOne(parentId);
    Array.isArray(ancestors) && ancestors.push(parentId);
    const assembledVariant = Object.assign(newVariant || {}, {
      _id: newVariantId,
      ancestors: ancestors,
      type: "variant",
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

const toDenormalize = [
  "price",
  "inventoryQuantity",
  "lowInventoryWarningThreshold",
  "inventoryPolicy",
  "inventoryManagement"
];


function getVariants(id, type){
  return Products.find({
    ancestors: { $in: [id] },
    type: "variant",
    variantType: type
  }).map(getPublishedOrRevision);
}

function deleteVariants(id, type) {
  var query = {
    ancestors: { $in: [id] },
    type: "variant",
    variantType: type
  };
  var ret = Products.find(query).map(getPublishedOrRevision);
  console.log("new delete length: ", ret.length)
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
  console.log("old delete length: ", ret.length)
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

function denormalize(id, field) {
  const doc = Products.findOne(id);
  let variants;
  if (doc.type === "simple") {
    variants = Catalog.getTopVariants(id);
  } else if (doc.type === "variant" && doc.ancestors.length === 1) {
    variants = getVariants(id);
  }
  const update = {};

  switch (field) {
    case "inventoryPolicy":
    case "inventoryQuantity":
    case "inventoryManagement":
      Object.assign(update, {
        isSoldOut: isSoldOut(variants),
        isLowQuantity: isLowQuantity(variants),
        isBackorder: isBackorder(variants),
      });
      break;
    case "lowInventoryWarningThreshold":
      Object.assign(update, {
        isLowQuantity: isLowQuantity(variants)
      });
      break;
    default: // "price" is object with range, min, max
      const priceObject = Catalog.getProductPriceRange(id);
      Object.assign(update, {
        price: priceObject,
      });
  }
  Products.update(id, {
    $set: update,
  }, {
    selector: {
      type: "simple",
    }
  });
}

function getPublishedOrRevision(product) {
  if (product.__revisions && product.__revisions.length) {
    const cleanProduct = Object.assign({}, product);
    delete cleanProduct.__revisions;

    return Object.assign({},
      product.__revisions[0].documentData,
      {
        __published: cleanProduct,
        __draft: product.__revisions[0]
      }
    );
  }
  return product;
}
