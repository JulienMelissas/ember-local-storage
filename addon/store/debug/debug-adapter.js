import { inferType } from '../relationships';
/**
  @module ember-local-storage
*/
var get = Ember.get;
var capitalize = Ember.String.capitalize;
var underscore = Ember.String.underscore;

/**
  Extend `Ember.DataAdapter` with LS specific code.

  @class DebugAdapter
  @namespace LS
  @extends Ember.DataAdapter
  @private
*/
export default Ember.DataAdapter.extend({
  getFilters: function() {
    return [];
  },

  detect: function(klass) {
    return klass;
  },

  columnsForType: function(type) {
    var columns = [{
      name: 'id',
      desc: 'Id'
    }];
    var count = 0;
    var self = this;
    get(type, 'attributes').forEach(function(meta, name) {
      if (count++ > self.attributeLimit) { return false; }
      var desc = capitalize(underscore(name).replace('_', ' '));
      columns.push({ name: name, desc: desc });
    });
    return columns;
  },

  getRecords: function(type) {
    return this.get('store').findAll(inferType(type));
  },

  getRecordColumnValues: function(record) {
    var self = this;
    var count = 0;
    var columnValues = { id: get(record, 'id') };

    record.eachAttribute(function(key) {
      if (count++ > self.attributeLimit) {
        return false;
      }
      var value = get(record, key);
      columnValues[key] = value;
    });
    return columnValues;
  },

  getRecordKeywords: function(record) {
    var keywords = [];
    var keys = Ember.A(['id']);
    record.eachAttribute(function(key) {
      keys.push(key);
    });
    keys.forEach(function(key) {
      keywords.push(get(record, key));
    });
    return keywords;
  },

  getRecordFilterValues: function(record) {
    return {};
  },

  getRecordColor: function(record) {
    return 'black';
  },

  observeRecord: function(record, recordUpdated) {
    var releaseMethods = Ember.A();
    var self = this;
    var keysToObserve = Ember.A(['id', 'isNew', 'isDirty']);

    record.eachAttribute(function(key) {
      keysToObserve.push(key);
    });

    keysToObserve.forEach(function(key) {
      var handler = function() {
        recordUpdated(self.wrapRecord(record));
      };
      Ember.addObserver(record, key, handler);
      releaseMethods.push(function() {
        Ember.removeObserver(record, key, handler);
      });
    });

    var release = function() {
      releaseMethods.forEach(function(fn) { fn(); } );
    };

    return release;
  }
});