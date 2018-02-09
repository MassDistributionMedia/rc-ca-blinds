import "./templates/productDetailOption.html";
import "./templates/productDetailOption.js";
import { registerComponent } from "@reactioncommerce/reaction-components";

import {
  ProductField,
  ProductTags,
  ProductMetadata,
  PriceRange,
  AddToCartButton,
  ProductNotFound,
  ProductOptionComponent
} from "./components";

import {
  Divider
} from "/imports/plugins/core/ui/client/components";

import {
  SocialContainer,
  VariantListContainer
} from "./containers";

import {
  AlertContainer,
  MediaGalleryContainer
} from "/imports/plugins/core/ui/client/containers";


// Register PDP components and some others
registerComponent("productOptionComponent", ProductOptionComponent);
registerComponent("ProductField", ProductField);
registerComponent("ProductTags", ProductTags);
registerComponent("ProductMetadata", ProductMetadata);
registerComponent("PriceRange", PriceRange);
registerComponent("AlertContainer", AlertContainer);
registerComponent("MediaGalleryContainer", MediaGalleryContainer);
registerComponent("SocialContainer", SocialContainer);
registerComponent("VariantListContainer", VariantListContainer);
registerComponent("AddToCartButton", AddToCartButton);
registerComponent("Divider", Divider);
registerComponent("ProductNotFound", ProductNotFound);
