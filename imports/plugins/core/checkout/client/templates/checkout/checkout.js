import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import "./checkout.html";
import { Session } from "meteor/session";
import Swiper from "swiper";

//
// cartCheckout is a wrapper template
// controlling the load order of checkout step templates
//

Template.cartCheckout.helpers({
  cart() {
    if (Reaction.Subscriptions.Cart.ready()) {
      return Cart.findOne();
    }
    return {};
  }
});


Template.cartCheckout.onCreated(function () {
  if (Reaction.Subscriptions.Cart.ready()) {
    const cart = Cart.findOne();
    if (cart.workflow && cart.workflow.status === "new") {
        // if user logged in as normal user, we must pass it through the first stage
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin", cart._id);
    }
  }
});

/**
 * checkoutSteps Helpers
 * helper isPending evaluates that this is
 * the current step, or has been processed already
 */
Template.checkoutSteps.helpers({
  isCompleted: function () {
    if (this.status === true) {
      return this.status;
    }
    return false;
  },

  isPending: function () {
    if (this.status === this.template) {
      return this.status;
    }
    return false;
  }
});

/**
 * checkoutStepBadge Helpers
 */
Template.checkoutStepBadge.helpers({
  checkoutStepBadgeClass: function () {
    const workflowStep = Template.instance().data;
    // let currentStatus = Cart.findOne().workflow.status;
    if (workflowStep.status === true || workflowStep.status === this.template) {
      return "active";
    }
    return "";
  }
});

Template.checkoutCartDrawer.helpers({
  cartItems: function () {
    return Cart.findOne().items;
  }
});

/**
 * openCartDrawer events
 *
 */
Template.checkoutCartDrawer.events({
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

