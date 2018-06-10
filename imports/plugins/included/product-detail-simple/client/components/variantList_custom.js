// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import Variant from "./variant";
// import { EditContainer } from "/imports/plugins/core/ui/client/containers";
// import { Divider, Translation } from "/imports/plugins/core/ui/client/components";
// import { ChildVariant } from "./";
// import { Reaction } from "/client/api";
// import { ReactionProduct } from "/lib/api";
// import { Components } from "@reactioncommerce/reaction-components";

// import RenderWidthHeightList, {
//   WIDTH_HEIGHT_VARIANT_TYPE,
// } from "/imports/plugins/custom/width-height-variant/client/render-list";

// function emptyOldVariants(productId) {
//   const variants = ReactionProduct.getVariants(productId, WIDTH_HEIGHT_VARIANT_TYPE);
//   variants.forEach(function (item) {
//     Meteor.call("products/deleteVariant", item._id);
//   });
// }

// function addNewVariants(productId, varientConfigs) {
//   varientConfigs.forEach((element, index) => {
//     Meteor.call("products/createVariant", productId, formatElement(index));
//   });
// }

// function formatElement(element) {
//   const width = element.width;
//   const height = element.height;
//   const uniqueKey = width + "x" + height;
//   return {
//     inventoryQuantity: 9,
//     type: WIDTH_HEIGHT_VARIANT_TYPE,
//     title: "Softwood Option " + uniqueKey,
//     optionTitle: "Softwood Option " + uniqueKey,
//     price: element.value,
//     height: height,
//     width: width,
//   };
// }

// class VariantList extends Component {
//   componentDidMount() {
//     // var productId = ReactionProduct.selectedVariantId();
//     // emptyOldVariants(productId);
//     // addNewVariants(productId, ProdPrices);
//   }

//   handleVariantEditClick = (event, editButtonProps) => {
//     if (this.props.onEditVariant) {
//       return this.props.onEditVariant(event, editButtonProps.data);
//     }
//     return true;
//   }

//   handleVariantVisibilityClick = (event, editButtonProps) => {
//     if (this.props.onVariantVisibiltyToggle) {
//       const isVariantVisible = !editButtonProps.data.isVisible;
//       this.props.onVariantVisibiltyToggle(event, editButtonProps.data, isVariantVisible);
//     }
//   }

//   handleChildVariantClick = (event, variant) => {
//     if (this.props.onVariantClick) {
//       this.props.onVariantClick(event, variant, 1);
//     }
//   }

//   handleChildVariantEditClick = (event, editButtonProps) => {
//     if (this.props.onEditVariant) {
//       return this.props.onEditVariant(event, editButtonProps.data, 1);
//     }
//     return true;
//   }

//   isSoldOut(variant) {
//     if (this.props.isSoldOut) {
//       return this.props.isSoldOut(variant);
//     }

//     return false;
//   }

//   renderVariants() {
//     let variants = [];
//     let addButton;

//     if (this.props.editable) {
//       addButton = (
//         <div className="rui items flex">
//           <div className="rui item full justify center">
//             <Components.IconButton
//               i18nKeyTooltip="variantList.createVariant"
//               icon="fa fa-plus"
//               primary={true}
//               tooltip="Create Variant"
//               onClick={this.props.onCreateVariant}
//             />
//           </div>
//         </div>
//       );
//     }

//     if (this.props.variants) {
//       variants = this.props.variants.map((variant, index) => {
//         const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);

//         return (
//           <Components.EditContainer
//             data={variant}
//             disabled={this.props.editable === false}
//             editView="variantForm"
//             i18nKeyLabel="productDetailEdit.editVariant"
//             key={index}
//             label="Edit Variant"
//             onEditButtonClick={this.handleVariantEditClick}
//             onVisibilityButtonClick={this.handleVariantVisibilityClick}
//             permissions={["createProduct"]}
//             showsVisibilityButton={true}
//           >
//             <Components.Variant
//               displayPrice={displayPrice}
//               editable={this.props.editable}
//               index={index}
//               isSelected={this.props.variantIsSelected(variant._id)}
//               onClick={this.props.onVariantClick}
//               onMove={this.props.onMoveVariant}
//               soldOut={this.isSoldOut(variant)}
//               variant={variant}
//             />
//           </Components.EditContainer>
//         );
//       });
//     }

//     const variantList = (
//       <ul className="variant-list list-unstyled" id="variant-list" key="variantList">
//         {variants}
//         {addButton}
//       </ul>
//     );

//     if (variants.length === 0 && this.props.editable === false) {
//       return variantList;
//     } else if (variants.length > 1 || variants.length === 0) {
//       return [
//         <Components.Divider
//           i18nKeyLabel="productDetail.options"
//           key="dividerWithLabel"
//           label="Options"
//         />,
//         variantList
//       ];
//     } else if (variants.length === 1) {
//       return [
//         <Components.Divider key="divider" />,
//         variantList
//       ];
//     }

//     return variantList;
//   }

//   renderChildVariants() {
//     if (!this.props.childVariants) {
//       return null;
//     }
//     // const lists = this.props.childVariants.reduce((variants, childVariant, index) => {
//     //   const type = childVariant.type;
//     //   if(!(type in variants)) {
//     //     variants[type] = [];
//     //   }
//     //   variants[type].push(childVariant);

//     //   return variants;
//     // }, {});
//     // var methods = this;
//     // var props = this.props;
//     // return Object.keys(lists).map(function(type){
//     //   const list = lists[type];
//     //   return renderList(type, list, props, methods)
//     // });
//     const list = this.props.childVariants.filter(function (variant) {
//       return !!variant.width && !!variant.height;
//     });
//     return renderWidthHeightList(list, this.props, this.methods);
//   }

//   render() {
//     return (
//       <div className="product-variants">
//         {this.renderVariants()}
//         {this.renderChildVariants()}
//       </div>
//     );
//   }
// }

// VariantList.propTypes = {
//   childVariantMedia: PropTypes.arrayOf(PropTypes.any),
//   childVariants: PropTypes.arrayOf(PropTypes.object),
//   displayPrice: PropTypes.func,
//   editable: PropTypes.bool,
//   isSoldOut: PropTypes.func,
//   onCreateVariant: PropTypes.func,
//   onEditVariant: PropTypes.func,
//   onMoveVariant: PropTypes.func,
//   onVariantClick: PropTypes.func,
//   onVariantVisibiltyToggle: PropTypes.func,
//   variantIsSelected: PropTypes.func,
//   variants: PropTypes.arrayOf(PropTypes.object),
// };

// export default VariantList;

// function renderList(type, list, props, methods) {
//   switch (type) {
//     case "variant" : return renderVariantList(list, props, methods);
//     case WIDTH_HEIGHT_VARIANT_TYPE : return renderWidthHeightList(list, props, methods);
//   }
// }

// function RenderVariantList(props) {
//   const {
//     renderList,
//     parentProps,
//     methods,
//   } = props;
  
  
//   if (!renderList) {
//     return null;
//   }

//   return (
//     <span>
//       <Components.Divider
//           key="availableOptionsDivider"
//           i18nKeyLabel="productDetail.availableOptions"
//           label="Available Options"
//       />
//       <div className="row variant-product-options" key="childVariantList">
//         <div>{
//           renderList.map((childVariant, index) => {
//             const media = parentProps.childVariantMedia.filter((mediaItem) => {
//               if (mediaItem.document.metadata.variantId === childVariant._id) {
//                 return true;
//               }
//               return false;
//             });

//             return (
//               <Components.EditContainer
//                 data={childVariant}
//                 disabled={parentProps.editable === false}
//                 editView="variantForm"
//                 i18nKeyLabel="productDetailEdit.editVariant"
//                 key={index}
//                 label="Edit Variant"
//                 onEditButtonClick={methods.handleChildVariantEditClick}
//                 onVisibilityButtonClick={methods.handleVariantVisibilityClick}
//                 permissions={["createProduct"]}
//                 showsVisibilityButton={true}
//               >
//                 <Components.ChildVariant
//                   isSelected={parentProps.variantIsSelected(childVariant._id)}
//                   media={media}
//                   onClick={methods.handleChildVariantClick}
//                   variant={childVariant}
//                 />
//               </Components.EditContainer>
//             );
//           })
//         }</div>
//       </div>
//     </span>
//   );
// }
