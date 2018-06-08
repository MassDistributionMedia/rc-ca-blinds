import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Product Detail Option",
  name: "product-detail-option",
  icon: "fa fa-cubes",
  autoEnable: true,
  registry: [{
    route: "/product/:handle/:variantId?",
    name: "product",
    template: "productDetailOption",
    workflow: "coreProductWorkflow",
    permissions: [
      {
        label: "Update Metafiled",
        permission: "products/updateMetaFields",
      },
      {
        label: "Create Product",
        permission: "products/createProduct",
      },
      {
        label: "Remove Product",
        permission: "products/deleteProduct",
      },
      {
        label: "Create Variant",
        permission: "products/createVariant",
      },
      {
        label: "Remove Variant",
        permission: "products/deleteVariant",
      },
    ],
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
      dashboardHeader: "productDetailOptionToolbar",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter",
    },
  }],
});