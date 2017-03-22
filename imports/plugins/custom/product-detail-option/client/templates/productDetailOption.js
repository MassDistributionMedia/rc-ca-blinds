import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { ProductDetailContainer, PublishContainer } from "../containers";

Template.productDetailOption.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductDetailContainer;
  }
});

Template.productDetailOptionToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: PublishContainer
    };
  }
});
