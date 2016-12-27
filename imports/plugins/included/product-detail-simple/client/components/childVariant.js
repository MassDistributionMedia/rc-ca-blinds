import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { MediaItem } from "/imports/plugins/core/ui/client/components";
import { ProdPrices } from "/lib/collections/prodPrices";

class ChildVariant extends Component {
  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  get hasMedia() {
    return Array.isArray(this.props.media) && this.props.media.length > 0;
  }

  get primaryMediaItem() {
    if (this.hasMedia) {
      return this.props.media[0];
    }

    return null;
  }

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  renderMedia() {
    if (this.hasMedia) {
      const media = this.primaryMediaItem;

      return (
        <MediaItem source={media.url()} />
      );
    }

    return null;
  }

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted
    });

    
    var rows = [];
    for (var i in ProdPrices) {
        rows.push(
          <li key={i} onClick={this.handleClick}> {ProdPrices[i].height} </li>
        );
    }
    
    let words = `<h3>Enter size</h3>
          <p>If you selected Inside Mount, enter your window size. For Outside Mount, enter the product size you want.</p>
          <h4>Width in inches &harr; &nbsp; </h4>
           <span className="eighthOptions"> </span>
          <div style={{width: 100 + '%'}}></div>
          <h4>Height &#8597; &nbsp; </h4>
          
          <span className="eighthOptions"></span>`;
    
    if ( this.props.isHeightWidth ) {
      
      // Dropdown li select in jQuery:
      //  - http://jsfiddle.net/Tpf7E/22/
      
      return (
        <div className="variant-select-option">
          
          <option
            className={classes}
            onClick={this.handleClick}
            type="button"
          >
            <span className="title">{variant.optionTitle}</span>
          </option>
          <div className="variant-controls">
            {this.renderDeletionStatus()}
            {this.props.visibilityButton}
            {this.props.editButton}
          </div>
          
        </div>
      );  
    }
    
    return (
      <div className="variant-select-option">
        <button
          className={classes}
          onClick={this.handleClick}
          type="button"
        >
          {this.renderMedia()}
          <span className="title">{variant.optionTitle}</span>
        </button>
        <div className="variant-controls">
          {this.renderDeletionStatus()}
          {this.props.visibilityButton}
          {this.props.editButton}
        </div>
      </div>
    );
  }
  
  /** Calculate the range of sizes to for the height & width dropdown */ 
  selectOptions() {
    let diameterOptions = [];
    for(let i=9;i<97;i++){
      diameterOptions.push({value: i, label: i+'"'});
    }
    return diameterOptions;
  }
  
  handleSelect() {
    return (value, event) => {
      console.log(value);
    }
  }
  /** Hard-coded range for eigths of inches fpr the height & width dropdown */
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
  
}

ChildVariant.propTypes = {
  editButton: PropTypes.node,
  isSelected: PropTypes.bool,
  isHeightWidth: PropTypes.bool,
  media: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func,
  variant: PropTypes.object,
  visibilityButton: PropTypes.node
};


export default ChildVariant;
