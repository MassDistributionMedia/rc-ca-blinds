import "./upload-template.html";
import { Template } from "meteor/templating";
import React from "react";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";



Template.widthHeightVariantUpload.events({
    "submit form" : function(e) {
        e.preventDefault();
        if(this.processing) return;
        var productId = this.productId;
        console.log("productId: ", productId);
        this.processing = true;
        var _this = this;
        new Promise(function(res, rej){
          var fileInput = e.target.querySelector("[name=variant-reciever]");
          var file = fileInput.files[0];
          if(!file) {
            rej("A file is required");
          }
          var reader = new FileReader();
          reader.onload = function(){
            res(reader.result);
          }
          reader.onerror = rej;
          reader.readAsText(file);
        }).then(function(text){
        // Hopefully this will automatically dispatch a "reload function"
          return new Promise(function(res, rej){
            Meteor.call("width-height-variant.set-variants", productId, text, function(err){
              _this.processing = false;
              if(err) return rej(err);
              res();
            })
          });
        }).then(function(){
          Alerts.toast("Variants Uploaded", "success");
        }, function(err) {
          Alerts.toast(
            `Upload failed : <pre>${
              htmlEntities(err.message | err.toString())
            }</pre>`, "error", 
            {
              html: true,
              timeout: 10000
            }
          );
        })
    }

});

export default width_heightVariantUploadForm;

function width_heightVariantUploadForm(){
    var productId = ReactionProduct.selectedProduct()._id;
    return <button onClick={function(e){
      e.preventDefault();
      Reaction.showActionView({
        label: "Width and Height Variant Upload",
        data: {
            processing: false,
            productId: productId
        },
        template: "widthHeightVariantUpload"
      });
    }} >Upload New Variants</button>;
}

function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}

