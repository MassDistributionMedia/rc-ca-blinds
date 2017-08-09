import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Product Detail Simple",
  name: "product-detail-simple",
  icon: "fa fa-cubes",
  autoEnable: false,
  registry: [{
    route: "/product/:handle/:variantId?",
    name: "product",
    template: "productDetailSimple",
    workflow: "coreProductWorkflow"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: false,
    structure: {
      template: "productDetailSimple",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "productDetailSimpleToolbar",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});