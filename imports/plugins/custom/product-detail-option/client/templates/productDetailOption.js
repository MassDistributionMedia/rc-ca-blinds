import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.productDetailOption.helpers({
  PDC() {
    return Components.ProductOptionComponent;
  }
});

Template.productDetailOptionToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: Components.ProductPublish
    };
  }
});
