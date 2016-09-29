import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
// import { Products, Media } from "/lib/collections";
import { Select } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.heightWidth.helpers({
  selectOptions() {
    let diameterOptions = [];
    for(let i=9;i<97;i++){
      diameterOptions.push({value: i, label: i+'"'});
    }
    return diameterOptions;
  },
  eighthOptions() {
    return [
      {value: 0, label: '0/8"'},
      {value: 1, label: '1/8"'},
      {value: 2, label: '2/8"'},
      {value: 3, label: '3/8"'},
      {value: 4, label: '4/8"'},
      {value: 5, label: '5/8"'},
      {value: 6, label: '6/8"'},
      {value: 7, label: '7/8"'}
    ];
  }
})