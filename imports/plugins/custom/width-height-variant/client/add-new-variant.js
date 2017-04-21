import { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";
export { WIDTH_HEIGHT_VARIANT_TYPE } from "../data/constants";

import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";

export default function addNewVariantIfNotExist(variantId, varientConfig) {
  try {
    return addNewVariant(variantId, formatElement(varientConfig));
  } catch(e) {
    console.log("Variant already exists: ", e);
  }
}

function formatElement(element) {
  const width = element.width;
  const height = element.height;
  const blindType = element.blindType;
  const widthEighth = element.widthEighth + "8th";
  const heightEighth = element.heightEighth + '8th';
  const unique_key = width + "-" + widthEighth + "x" + height + "-" + heightEighth + "-" + blindType;

  return {
    _id: "SoftwoodOption" + unique_key + "Price" + element.price,
    variantType: WIDTH_HEIGHT_VARIANT_TYPE,
    title: "Softwood Option " + unique_key,
    optionTitle: "Softwood Option " + unique_key,
    price: element.price,
    height: height,
    width: width,
    blindType: blindType,
    weight: 0,
    inventoryQuantity: 9,
    inventoryPolicy: false,
    title: "Softwood Option " + unique_key,
  };
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
    metafields: [
      {
        key: "Room",
        value: "",
        scope: "detail"
      },
      {
        key: "Window Name",
        value: "",
        scope: "detail"
      },
      {
        key: "Mount",
        value: "",
        scope: "detail"
      },
      {
        key: "Height",
        value: newVariant.height,
        scope: "detail"
      },
      {
        key: "Blind Type",
        value: newVariant.blindType,
        scope: "detail"
      },
      {
        key: "Color",
        value: "",
        scope: "detail"
      },
      {
        key: "Slate Size",
        value: "",
        scope: "detail"
      },
      {
        key: "Lift",
        value: "",
        scope: "detail"
      },
      {
        key: "Lift Side",
        value: "",
        scope: "detail"
      },
      {
        key: "Tilt",
        value: "",
        scope: "detail"
      },
      {
        key: "Tilt Side",
        value: "",
        scope: "detail"
      },
    ]
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
