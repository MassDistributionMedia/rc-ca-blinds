import Swiper from "swiper";
import { Components } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Cart } from "/lib/collections";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
 * cartDrawer helpers
 *
 * @provides displayCartDrawer
 * @returns  open or closed cart drawer template
 */

Template.cartDrawer.helpers({
  displayCartDrawer: function () {
    if (!Session.equals("displayCart", true)) {
      return null;
    }

    const storedCart = Cart.findOne();
    let count = 0;

    if (typeof storedCart === "object" && storedCart.items) {
      for (const items of storedCart.items) {
        count += items.quantity;
      }
    }

    if (count === 0) {
      return Template.emptyCartDrawer;
    }
    return Template.openCartDrawer;
  },
  cartItems: function () {
    return Cart.findOne().items;
  },
});

/**
 * openCartDrawer helpers
 *
 */
Template.openCartDrawer.onRendered(function () {
  /**
   * Add swiper to openCartDrawer
   *
   */

  let swiper;

  $("#cart-drawer-container").fadeIn(() => {
    if (!swiper) {
      swiper = new Swiper(".cart-drawer-swiper-container", {
        direction: "horizontal",
        setWrapperSize: true,
        loop: false,
        grabCursor: true,
        slidesPerView: "auto",
        wrapperClass: "cart-drawer-swiper-wrapper",
        slideClass: "cart-drawer-swiper-slide",
        slideActiveClass: "cart-drawer-swiper-slide-active",
        pagination: ".cart-drawer-pagination",
        paginationClickable: true
      });
    }
  });
});

Template.openCartDrawer.helpers({
  CartDrawerContainer() {
    return Components.CartDrawer;
  }
});

Template.emptyCartDrawer.onRendered(function () {
  return $("#cart-drawer-container").fadeIn();
});

Template.emptyCartDrawer.helpers({
  EmptyCartDrawer() {
    return Components.EmptyCartDrawer;
  }
});

/**
 * openCartDrawer events
 *
 */
Template.cartDrawer.events({
  "click #btn-checkout": function () {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  },
  "click .remove-cart-item": function (event) {
    event.stopPropagation();
    event.preventDefault();
    const currentCartItemId = this._id;

    return Template.instance().$(event.currentTarget).fadeOut(300, function () {
      return Meteor.call("cart/removeFromCart", currentCartItemId);
    });
  }
});
