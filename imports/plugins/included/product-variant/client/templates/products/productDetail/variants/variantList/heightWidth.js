import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { ProdPrices } from "/lib/collections/prodPrices";
// import { Products, Media } from "/lib/collections";
import { Select } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { Packages, Shops } from "/lib/collections";
import { Template } from "meteor/templating";

function prodProps(num) {
  let softwoodProperties = {
    inventoryQuantity: 9,
    title: "Softwood Option " + num,
    optionTitle: "Softwood Option " + num,
    price: ProdPrices[num].price,
    height: ProdPrices[num].height,
    width: ProdPrices[num].width
  }
  return softwoodProperties;
}

/**
 * heightWidth onRendered
 */
var hwRan = false;
Template.onCreated(function () {
  
  // if(ReactionProduct.get("productId"))
    // debugger;
  
  function heightWidthOptions(){
    var hwId = _.find(ReactionProduct.getTopVariants(), o => o.variantType === "Height & Width")._id;
    var clearVariants = ReactionProduct.getVariants(hwId);
    clearVariants.forEach(e => {
      Meteor.call("products/deleteVariant", e._id);
    });
    
    ProdPrices.forEach((element, index) => {
      Meteor.call("products/createVariant", ReactionProduct.selectedVariantId(), prodProps(index));
    });
    hwRan = true;
  }
  
  return this.autorun(() => {
    if(_.find(ReactionProduct.getTopVariants(), o => o.variantType === "Height & Width") && hwRan === false) {
      heightWidthOptions();
    }
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
});

Template.heightWidth.helpers({
  /** Calculate the range of sizes to for the height & width dropdown */ 
  selectOptions() {
    let diameterOptions = [];
    for(let i=9;i<97;i++){
      diameterOptions.push({value: i, label: i+'"'});
    }
    return diameterOptions;
  },
  
  handleSelect() {
    return (value, event) => {
      console.log(value);
    }
  },
  /** Hard-coded range for eigths of inches fpr the height & width dropdown */
  eighthOptions() {
    return [
      {value: 0, label: '0/8"'},
      {value: 1, label: '1/8"'},
      {value: 2, label: '2/8"'},
      {value: 3, label: '3/8"'},
      {value: 4, label: '4/8"'},
      {value: 5, label: '5/8"'},
      {value: 6, label: '6/8"'},
      {value: 7, label: '7/8"'}
    ];
  }
})