import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Product Detail Option",
  name: "product-detail-option",
  icon: "fa fa-cubes",
  autoEnable: false,
  registry: [{
    route: "/product/:handle/:variantId?",
    name: "product",
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
      dashboardHeader: "productDetailOptionToolbar",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});