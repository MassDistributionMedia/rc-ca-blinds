import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { ProductOptionContainer, PublishContainer } from "../containers";

Template.productDetailOption.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductOptionContainer;
  }
});

Template.productDetailOptionToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: PublishContainer
    };
  }
});
