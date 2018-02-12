import "./checkout.html";
// import Swiper from "swiper";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
// import { Media } from "/lib/collections";
// import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import CartSubTotals from "/imports/plugins/core/checkout/client/containers/cartSubTotalContainer"; // "../../container/cartSubTotalContainer";
// import CartDrawer from "/imports/plugins/core/checkout/client/components/cartDrawer.js";

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
  },
  CartSubTotals() {
    return CartSubTotals;
  },
  cartCount() {
    const cart = Cart.findOne();
    if (cart.items && cart.items.length > 0) {
      return true;
    }
    return false;
  }
});


Template.cartCheckout.onCreated(() => {
  if (Reaction.Subscriptions.Cart.ready()) {
    const cart = Cart.findOne();
    if (cart && cart.workflow && cart.workflow.status === "new") {
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
  isCompleted() {
    if (this.status === true) {
      return this.status;
    }
    return false;
  },

  isPending() {
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
  checkoutStepBadgeClass() {
    const workflowStep = Template.instance().data;
    // let currentStatus = Cart.findOne().workflow.status;
    if (workflowStep.status === true || workflowStep.status === this.template) {
      return "active";
    }
    return "";
  }
});
