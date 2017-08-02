import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Blind Detail Option",
  name: "product-detail-option",
  icon: "fa fa-cubes",
  autoEnable: true,
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
    enabled: true,
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
