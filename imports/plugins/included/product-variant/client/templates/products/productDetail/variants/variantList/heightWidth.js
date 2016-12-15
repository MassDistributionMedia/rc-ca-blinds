import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
// import { Products, Media } from "/lib/collections";
import { Select } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";


/**
 * heightWidth onRendered
 */
Template.onRendered(function () {
  this.autorun(() => {
    const selectedProductId = Reaction.Router.getParam("productId");
    const selectedVariantId = Reaction.Router.getParam("variantId");
    const selectedParentId = Reaction.Router.getParam("parentId");
    
    // https://github.com/reactioncommerce/reaction/blob/c842d27fde639e3fd5709db99c261a7d59647c8d/lib/api/products.js#L109
    // 1 ReactionProduct.selectedVariantId()
    // 2 Meteor.call("products/createVariant" ...
    
    
    
    if(ReactionProduct.get("productId"))
      debugger;
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