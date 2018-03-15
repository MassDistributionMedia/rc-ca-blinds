import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { StyleRoot } from "radium";
import { compose } from "recompose";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media, Cart } from "/lib/collections";
// import { Loading } from "/imports/plugins/core/ui/client/components";
import { ProductOptionComponent } from "../components";
import SelectedVariants from "../stores/selectedVariants";
import { SocialContainer, VariantListContainer } from "./";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

const wrapComponent = (Comp) => (
  class ProductOptionContainer extends Component {
    static propTypes = {
      media: PropTypes.arrayOf(PropTypes.object),
      product: PropTypes.object,
      storedCart: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.animationTimeOut = null;
      this.textTimeOut = null;

      this.state = {
        cartQuantity: 1,
        productClick: 0
      };
    }

    handleCartQuantityChange = (event, quantity) => {
      this.setState({
        cartQuantity: Math.max(quantity, 1)
      });
    }

    handleAddToCart = () => {
      let productId;
      let quantity;
      const currentProduct = ReactionProduct.selectedProduct();

      // if (!currentProduct.isVisible) {
      //   console.log('current product is not visible');
      //   Alerts.inline("Publish product before adding to cart.", "error", {
      //     placement: "productDetail",
      //     i18nKey: "productDetail.publishFirst",
      //     autoHide: 10000
      //   });
      //   return [];
      // }

      Promise.resolve().then(() =>
        SelectedVariants.composeNewVariant()).then((newVariant) => {
        quantity = parseInt(this.state.cartQuantity, 10);

        if (quantity < 1) {
          quantity = 1;
        }
        productId = currentProduct._id;
        const variantId = newVariant._id;

        console.log(productId, variantId);

        if (productId) {
          Meteor.call("cart/addToCart", productId, variantId, quantity, (error) => {
            if (error) {
              Logger.error("Failed to add to cart.", error);
              return error;
            }
            // Reset cart quantity on success
            this.handleCartQuantityChange(null, 1);

            return true;
          });
        }

        // template.$(".variant-select-option").removeClass("active");
        ReactionProduct.setCurrentVariant(null);
        // qtyField.val(1);
        // scroll to top on cart add
        $("html,body").animate({
          scrollTop: 0
        }, 0);
        // slide out label
        const addToCartText = i18next.t("productDetail.addedToCart");
        const addToCartTitle = currentProduct.title || "";
        $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);

        // Grab and cache the width of the alert to be used in animation
        const alertWidth = $(".cart-alert").width();
        const direction = i18next.dir() === "rtl" ? "left" : "right";
        const oppositeDirection = i18next.dir() === "rtl" ? "right" : "left";

        // Animate
        return $(".cart-alert")
          .show()
          .css({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          })
          .animate({
            [oppositeDirection]: "auto",
            [direction]: 0
          }, 600)
          .delay(4000)
          .animate({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          }, {
            duration: 600,
            complete() {
              $(".cart-alert").hide();
            }
          });
      }).catch((e) => {
        console.log(e);
        Alerts.inline(e.message, "error", {
          placement: "productDetail",
          i18nKey: "productDetail.publishFirst",
          autoHide: 10000
        });
        return [];
      });
    }

    handleProductFieldChange = (productId, fieldName, value) => {
      Meteor.call("products/updateProductField", productId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    }

    handleViewContextChange = (event, value) => {
      Reaction.Router.setQueryParams({ as: value });
    }

    handleDeleteProduct = () => {
      ReactionProduct.archiveProduct(this.props.product);
    }

    handleVariantChoice = (variant) => {
      this.state.requiredVariants.some((reqVariant) => {
        if (reqVariant._id === variant._id) {
          return true;
        }
        if (variant.ancestors.indexOf(variant._id) === -1) {
          return false;
        }
        const oldVariantPicks = this.state.variantPicks;
        oldVariantPicks[variant._id] = variant._id;
        this.setState({
          variantPicks: oldVariantPicks
        });
        return true;
      });
    }

    render() {
      if (_.isEmpty(this.props.product)) {
        return (
          <Components.ProductNotFound />
        );
      }
      return (
        <DragDropProvider>
          <StyleRoot>
            <Comp
              cartQuantity={this.state.cartQuantity}
              mediaGalleryComponent={<Components.MediaGallery media={this.props.media} />}
              onAddToCart={this.handleAddToCart}
              onCartQuantityChange={this.handleCartQuantityChange}
              onViewContextChange={this.handleViewContextChange}
              socialComponent={<SocialContainer />}
              topVariantComponent={<VariantListContainer />}
              onDeleteProduct={this.handleDeleteProduct}
              handleVariantChoice={this.handleVariantChoice}
              onProductFieldChange={this.handleProductFieldChange}
              {...this.props}
            />
          </StyleRoot>
        </DragDropProvider>
      );
    }
  }
);

// ProductOptionContainer.propTypes = {
//   media: PropTypes.arrayOf(PropTypes.object),
//   product: PropTypes.object
// };

function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  const productId = Reaction.Router.getParam("handle");
  const variantId = Reaction.Router.getParam("variantId");
  const revisionType = Reaction.Router.getQueryParam("revision");
  const viewProductAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  let productSub;

  if (productId) {
    productSub = Meteor.subscribe("Product", productId);
  }

  if (productSub && productSub.ready() && tagSub.ready()) {
    // Get the product
    const product = ReactionProduct.setProduct(productId, variantId);

    if (Reaction.hasPermission("createProduct")) {
      if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
        Reaction.setActionView({
          template: "productAdmin",
          data: product
        });
      }
    }

    // Get the product tags
    if (product) {
      let tags;
      if (_.isArray(product.hashtags)) {
        tags = _.map(product.hashtags, (id) => Tags.findOne(id));
      }

      let mediaArray = [];
      const selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        // Find the media for the selected variant
        mediaArray = Media.find({
          "metadata.variantId": selectedVariant._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        }).fetch();

        // If no media found, broaden the search to include other media from parents
        if (Array.isArray(mediaArray) && mediaArray.length === 0 && selectedVariant.ancestors) {
          // Loop through ancestors in reverse to find a variant that has media to use
          for (const ancestor of selectedVariant.ancestors.reverse()) {
            const media = Media.find({
              "metadata.variantId": ancestor
            }, {
              sort: {
                "metadata.priority": 1
              }
            }).fetch();

            // If we found some media, then stop here
            if (Array.isArray(media) && media.length) {
              mediaArray = media;
              break;
            }
          }
        }
      }

      let priceRange;
      if (selectedVariant && typeof selectedVariant === "object") {
        const childVariants = ReactionProduct.getVariants(selectedVariant._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          priceRange = selectedVariant.price;
        } else {
          // otherwise we want to show child variants price range
          priceRange = ReactionProduct.getVariantPriceRange();
        }
      }

      let productRevision;

      if (revisionType === "published") {
        productRevision = product.__published;
      }

      let editable;

      if (viewProductAs === "customer") {
        editable = false;
      } else {
        editable = Reaction.hasPermission(["createProduct"]);
      }

      const topVariants = ReactionProduct.getTopVariants();
      const storedCart = Cart.findOne();

      onData(null, {
        variants: topVariants,
        layout: product.template || "productDetailSimple",
        product: productRevision || product,
        priceRange,
        tags,
        media: mediaArray,
        editable,
        viewAs: viewProductAs,
        hasAdminPermission: Reaction.hasPermission(["createProduct"]),
        storedCart
      });
    } else {
      // onData must be called with composeWithTracker, or else the loading icon will show forever.
      onData(null, {});
    }
  }
}

registerComponent("ProductOptionComponent", ProductOptionComponent, [
  composeWithTracker(composer),
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductOptionComponent);
