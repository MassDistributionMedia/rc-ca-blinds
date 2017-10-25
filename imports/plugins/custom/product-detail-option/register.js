import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Blind Detail Option",
  name: "product-detail-option",
  icon: "fa fa-cubes",
  autoEnable: false,
  registry: [{
    route: "/not-product/:handle/:variantId?",
    name: "not-product",
    template: "productDetailOption",
    workflow: "coreProductWorkflow"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: false,
    structure: {
      template: "productDetailOption",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "productDetailOptionToolbar",  // productDetailSimpleToolbar
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});

import { Products } from "/lib/collections";
import { Meteor } from "meteor/meteor";


Meteor.startup(function () {

  Meteor.methods({
    'product-detail-option.insertVariant'(assembledVariant) {
      check(assembledVariant,Match.Any);
      return new Promise(function(resolve, reject){
      var id = Products.insert(assembledVariant,
        (error, result) => {
          if(error) {
            reject(error);
          } else {
            resolve(id);
          }
        }
      );
      })
    },
  })
});
