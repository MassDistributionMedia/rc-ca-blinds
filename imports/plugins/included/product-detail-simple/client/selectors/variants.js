import { ReactionProduct } from "/lib/api";

export function getChildVariants() {
  const childVariants = [];
  const variants = ReactionProduct.getVariants();
  if (variants.length === 0) {
    return null
  }
  const current = ReactionProduct.selectedVariant();

  if (!current) {
    return [];
  }

  if (current.ancestors.length === 1) {
    return variants.filter(function(variant){
      if(typeof variant.ancestors[1] !== "string") {
        return false;
      }
      if(variant.ancestors[1] !== current._id) {
        return false;
      }
      if(!variant.optionTitle){
        return false;
      }
      if(variant.type === "inventory"){
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
