import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { ReactionProduct } from "/lib/api";
import { ProdPrices } from "/lib/collections/prodPrices";
// import { Products, Media } from "/lib/collections";
import { Media, Products, Revisions, Tags } from "/lib/collections";
import { Packages, Shops } from "/lib/collections";
import { Template } from "meteor/templating";

import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";

var hwRan = false;
function heightWidthOptions() {
  if(hwRan) return;
  hwRan = true;
  var oldVariants = ReactionProduct.getTopVariants();
  var toRemove = oldVariants;
  // var clearVariants = ReactionProduct.getVariants(hwId);
  toRemove.forEach(function(item) {
    Meteor.call("products/deleteVariant", item._id);
  });
  // clearVariants.forEach(e => {
  // });

}

function emptyOldVariants(productId) {
    const variants = ReactionProduct.getVariants(productId, WIDTH_HEIGHT_VARIANT_TYPE);
    variants.forEach(function(item) {
        Meteor.call("products/deleteVariant", item._id);
    });
}

function formatElement(element) {
    var width = element.width, height = element.height;
    var unique_key = width + "x" + height;
    return {
        inventoryQuantity: 9,
        type: WIDTH_HEIGHT_VARIANT_TYPE,
        title: "Softwood Option " + unique_key,
        optionTitle: "Softwood Option " + unique_key,
        price: element.value,
        height: height,
        width: width,
    }
}

function addNewVariants(productId, varientConfigs) {
  varientConfigs.forEach((element, index) => {
    addNewVariant(productId, formatElement(element))
  });
}

Meteor.startup(function () {
    Meteor.methods({
      'width-height-variant.set-variants'({ productId, variantConfigFile }) {
        console.log("set variant");
        var variantConfigs = JSON.parse(variantConfigFile);
        // emptyOldVariants(productId);
        // addNewVariants(productId, varientConfigs);
      }
    });

    /**
     * heightWidth onRendered
     */
  // if(ReactionProduct.get("productId"))
    // debugger;

//   return this.autorun(() => {
//   });

  heightWidthOptions();
  var hackyProductId = "BCTMZ6HTxFSppJESk";
  var hackyPrices = ProdPrices;
  emptyOldVariants(hackyProductId);
  addNewVariants(hackyProductId, hackyPrices);
    // https://github.com/reactioncommerce/reaction/blob/1eec469f19f765c1ca7f45bfe0e6bf39177e64f1/lib/collections/schemas/products.js#L74
    // https://github.com/reactioncommerce/reaction/blob/c842d27fde639e3fd5709db99c261a7d59647c8d/lib/api/products.js#L109
    // 1 ReactionProduct.selectedVariantId() // nMf6PybiAu5RHENHg
    // 2 Meteor.call("products/createVariant" ...

    // Meteor.call("products/createVariant", ReactionProduct.selectedVariantId());
    
    // To create a child option from a variant
    // https://github.com/reactioncommerce/reaction/blob/1eec469f19f765c1ca7f45bfe0e6bf39177e64f1/server/methods/catalog.js#L397
    // Meteor.call("products/cloneVariant", selectedProductId, selectecVariantId, selectedParentId);

    // $(`div.child-variant-collapse:not(#child-variant-form-${selectedVariantId})`).collapse("hide");
    // $(`#child-variant-form-${selectedVariantId}`).collapse("show");
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


function addNewVariant(parentId, newVariant){
  
    const newVariantId = Random.id();
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
    variants = Catalog.getVariants(id);
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
