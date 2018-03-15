import { ReactionProduct } from "/lib/api";
// import SelectedVariants from "../stores/selectedVariants";

export function getChildVariants() {
  const variants = ReactionProduct.getVariants();
  const childVariants = [];

  if (variants.length === 0) {
    return null
  }
  const current = ReactionProduct.selectedVariant();

  if (!current) {
    return [];
  }

  if (current.ancestors.length === 1) {
    return variants.filter(function(variant){
      if(typeof variant.ancestors[1] !== "string"
        || variant.ancestors[1] !== current._id
        || !variant.optionTitle
        || variant.type === "inventory"
        || variant.type === "make-shift") {
        return false;
      }

      return true;
    });
  }
  // TODO not sure we need this part...
  return variants.filter(variant => {
    return (
      typeof variant.ancestors[1] === "string" &&
      variant.ancestors.length === current.ancestors.length &&
      variant.ancestors[1] === current.ancestors[1] &&
      variant.optionTitle &&
      true
    );
  });
}

export function getChildVariant(variantId) {
  const variants = ReactionProduct.getVariants();
  const productObject = getProductObject(variants);

  return productObject[variantId];
}

export function getProductObject(variantsToSet) {
  let productObject = {};
  let variantOptions = [];
  for(let index in variantsToSet) {
    if(variantsToSet[index].ancestors.length === 1) {
      let key = variantsToSet[index].title;

      productObject[key] = [];
      variantOptions.push(variantsToSet[index]);
    }
  }
  return setChildVariants(variantsToSet, productObject, variantOptions);
}

export function setChildVariants(variantsToSet, productObject, variantOptions) {
  let product = productObject;
  for(let index in variantsToSet) {
    if(variantsToSet[index].ancestors.length >= 2) {
      let ancestors = variantsToSet[index].ancestors;

      for(let i in ancestors) {
        let parentKey = findParentVariant(variantOptions, ancestors[i]);

        parentKey ? product[parentKey].push(variantsToSet[index]): null;
      }
    }
  }
  return product;
}

export function findParentVariant(variantOptions, id) {
  for(let index in variantOptions) {
    if(variantOptions[index]._id === id) {
      return variantOptions[index].title;
    }
  }
  return null;
}