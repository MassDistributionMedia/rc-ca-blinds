import { Reaction } from "/server/api";
import SimpleLayout from "../lib/layout/simple";
import TwoColumnLayout from "../lib/layout/twoColumn";
import "./i18n";

Reaction.registerTemplate({
  name: "productDetailOption",
  title: "Product Detail Option Layout",
  type: "react",
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: SimpleLayout()
});

Reaction.registerTemplate({
  name: "productDetailOptionTwoColumn",
  title: "Product Detail Option Two Column Layout",
  type: "react",
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: TwoColumnLayout()
});
