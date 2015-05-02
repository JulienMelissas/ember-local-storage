import Ember from 'ember';
import StorageObject from '../local/object';

export default StorageObject.extend({
  init: function() {
    var initialContent,
      attributes = this._attributes || {};

    this.initialContent = attributes;
    this._super.apply(this, arguments);
    this.initialContent = null;
  },

  willDestroy: function() {
    delete this.storage()[this.get('storageKey')];
  }
});