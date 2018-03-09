import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";

let variantMap;
let variantsToSet;
let listeners = [];
const productObject = {};
const variantOptions = [];

export function setProduct(nextProduct) {
  let currentProduct = ReactionProduct.selectedProduct();
  if (currentProduct && currentProduct._id === nextProduct._id) {
    return;
  }
  currentProduct = nextProduct;
  variantsToSet = ReactionProduct.getVariants(nextProduct._id).filter((variant) => variant.variantType !== "make-shift");
  variantsToSet = variantsToSet.sort((a, b) => a._id - b._id);
  variantMap = {};
  listeners = [];
}

export function handelingProduct() {
  const currentProduct = ReactionProduct.selectedProduct();
  return !!currentProduct;
}

export function onUpdate(fn) {
  listeners.push(fn);
}
export function offUpdate(fn) {
  const i = listeners.indexOf(fn);
  i > -1 && listeners.splice(i, 1);
}

export function setVariant(childVariant) {
  const currentProduct = ReactionProduct.selectedProduct();
  const parentVariantId = childVariant.ancestors[childVariant.ancestors.length - 1];
  if (parentVariantId === currentProduct._id) {
    return;
  }
  // if (!variantsToSet.some((variant) =>
  //   variant._id === parentVariantId)) {
  //   throw new Error("This variant does not have valid ancestry");
  // }
  variantMap[parentVariantId] = childVariant._id;

  listeners.forEach((fn) => fn());

  setProductObject();
  setChildVariants();
}

export function setProductObject() {
  for (const index in variantsToSet) {
    if (variantsToSet[index].ancestors.length === 1) {
      const key = variantsToSet[index].title;

      productObject[key] = [];
      variantOptions.push(variantsToSet[index]);
    }
  }
}

export function setChildVariants() {
  for (const index in variantsToSet) {
    if (variantsToSet[index].ancestors.length >= 2) {
      const { ancestors } = variantsToSet[index];

      for (const i in ancestors) {
        if (ancestors.prototype.call(hasOwnProperty(i))) {
          const parentKey = findParentVariant(ancestors[i]);

          parentKey ? productObject[parentKey].push(variantsToSet[index]) : null;
        }
      }
    }
  }
}

export function findParentVariant(id) {
  for (const index in variantOptions) {
    if (variantOptions[index]._id === id) {
      return variantOptions[index].title;
    }
  }
  return null;
}

export function retrieveCurrentPrice() {
  const currentProduct = ReactionProduct.selectedProduct();
  if (!currentProduct) {
    return 0;
  }
  return Object.keys(variantMap).reduce((price, parentID) => {
    const setThisVariant = Products.findOne(variantMap[parentID]);
    if (!setThisVariant) {
      throw new Error("This variant does not exist");
    }
    return price + setThisVariant.price;
  }, 0);
}

export function retrieveMetaValues() {
  const currentProduct = ReactionProduct.selectedProduct();
  if (!currentProduct) {
    return [];
  }

  return Object.keys(variantMap).reduce((netArray, parentID) => {
    const reqVariant = Products.findOne(parentID);
    const setThisVariant = Products.findOne(variantMap[parentID]);
    if (!setVariant) {
      throw new Error("This variant does not exist");
    }
    const values = extractValuesFromVariant(setThisVariant, reqVariant);
    const metafields = valuesToMetaFields(values);
    // console.log('values', values);
    // console.log('metafields', metafields);

    return netArray.concat(metafields);
  }, []);
}

export function composeNewVariant() {
  /* Check if all the variants options are selected or not */
  // let variantMapLength = _.size(variantMap);
  // if(variantMapLength < variantOptions.length) {
  //   throw new Error('A variant option is missing. Please select all the variants');
  // }

  const currentProduct = ReactionProduct.selectedProduct();
  const netVariant = {
    _id: "",
    price: 0,
    values: [],
    metafields: [],
    inventoryQuantity: 111,
    isProductBundle: true
  };

  for (const reqVariant in variantMap) {
    if (variantMap.property.call(hasOwnProperty(reqVariant))) {
      const parentVariant = Products.findOne(reqVariant);
      // const setVariant = Products.findOne(variantMap[reqVariant]);

      if (!setVariant) {
        throw new Error("This variant does not exist");
      }

      const values = extractValuesFromVariant(setVariant, parentVariant);
      const metafields = valuesToMetaFields(values);

      netVariant.price += setVariant.price;
      netVariant.values = netVariant.values.concat(values);
      netVariant.metafields = netVariant.metafields.concat(metafields);
      netVariant._id += hash(parentVariant._id).toString(32) + hash(setVariant._id).toString(32);
    }
  }

  netVariant.type = "variant";
  netVariant.title = `Custom Bundled ${currentProduct.title}`;

  return addNewVariant(currentProduct._id, netVariant);
}

const MULTIPLIER = 37;
function hash(str) {
  return str.split("").reduce((h, char) => MULTIPLIER * h + char.charCodeAt(0), 0);
}

function extractValuesFromVariant(variant, parent) {
  switch (variant.variantType) {
    case "variant":
      return {
        [parent.title]: variant.optionTitle
      };
    case "blindsHeightWidth":
      return {
        Width: `${variant.width} ${variant.widthEighth}/8`,
        Height: `${variant.height} ${variant.heightEighth}/8`,
        BlindType: variant.blindType
      };
    default:
      return {
        [parent.title]: variant.optionTitle
      };
  }
}

function valuesToMetaFields(values) {
  return Object.keys(values).reduce((netArray, key) => {
    const newObj = {};
    newObj.key = key;
    newObj.value = values[key];
    return netArray.concat([newObj]);
  }, []);
}

function addNewVariant(parentId, newVariant) {
  const newVariantId = newVariant._id;
  const { ancestors } = Products.findOne(parentId);

  Array.isArray(ancestors) && ancestors.push(parentId);
  const assembledVariant = Object.assign(newVariant || {}, {
    _id: newVariantId,
    ancestors,
    type: "variant",
    isVisible: true,
    inventoryQuantity: 111
  });

  if (!newVariant) {
    Object.assign(assembledVariant, {
      title: "",
      price: 0.00
    });
  }

  return new Promise((resolve, reject) => {
    Meteor.call(
      "product-detail-option.insertVariant", assembledVariant,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  }).then((variantId) => {
    assembledVariant._id = variantId;
    return newVariant;
  });


  // Products.insert(assembledVariant,
  //   (error, result) => {
  //     if(error) {
  //       console.error(error);
  //     }
  //     if (result) {
  //       console.log(
  //         `products/createVariant: created variant: ${
  //           newVariantId} for ${parentId}`
  //       );
  //     }
  //   }
  // );
}
