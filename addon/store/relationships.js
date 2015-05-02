import Ember from 'ember';
import Model from './model';
import RecordArray from './record-array';
import { find, findMany } from '../store';

var get = Ember.get,
  computed = Ember.computed;

Model.reopenClass({
  relationships: computed(function() {
    var map = Ember.Map.create();

    this.eachComputedProperty(function(name, meta) {
      if (meta.isRelationship) {
        meta.key = name;
        map.set(name, meta);
      }
    });

    return map;
  }).readOnly(),

  eachRelationship: function(callback, binding) {
    get(this, 'relationships').forEach(function(meta, name) {
      callback.call(binding, name, meta);
    }, binding);
  }
});

Model.reopen({
  eachRelationship: function(callback, binding) {
    this.constructor.eachRelationship(callback, binding);
  },

  clearRelationships: function() {
    this.eachRelationship(function(name, meta) {
      if (meta.isRelationship) {
        var inverseType = meta.options.inverse || inferType(this),
          relation;

        meta.key = name;

        if (meta.kind === 'hasMany' && meta.options.dependent === 'nullify') {
          var relationKey = belongsToKey(inverseType);

          relation = this.get(name);
          relation.forEach(function(record) {
            record.set(relationKey, null);
          });
        }

        if (meta.kind === 'belongsTo' && meta.options.dependent === 'nullify') {
          relation = this.get(name);
          console.log(meta, name, relation);

          if (relation && relation.get(pluralize(inverseType))) {
            relation.get(pluralize(inverseType)).removeObject(this);
          }
        }
      }
    }, this);
  }
});

function belongsTo(type, options) {
  if (typeof type === 'object') {
    options = type;
    type = undefined;
  }

  Ember.assert('The first argument to LS.belongsTo must be a string representing a model type key, not an instance of ' + Ember.inspect(type) + '. E.g., to define a relation to the Person model, use LS.belongsTo("person")', typeof type === 'string' || typeof type === 'undefined');

  options = options || {};

  var meta = {
    type: type,
    isRelationship: true,
    options: options,
    kind: 'belongsTo',
    key: null
  };

  return computed(function(key, value) {
    var relationKey = belongsToKey(type),
      inverseType = options.inverse || pluralize(inferType(this)),
      relationId = this.get(relationKey);

    if (arguments.length > 1) {
      if ( value === undefined ) {
        value = null;
      }

      if (value) {
        this.set(relationKey, value.get('id'));
      }

      if (
        value &&
        value.get(inverseType) &&
        !value.get(inverseType).findBy('id', this.get('id'))
      ) {
        value.get(inverseType).addObject(this);
      }

      return value;
    }

    return relationId ? find(type, relationId) : null;
  }).meta(meta);
}

function hasMany(type, options) {
  if (typeof type === 'object') {
    options = type;
    type = undefined;
  }

  Ember.assert('The first argument to LS.hasMany must be a string representing a model type key, not an instance of ' + Ember.inspect(type) + '. E.g., to define a relation to the Comment model, use LS.hasMany("comment")', typeof type === 'string' || typeof type === 'undefined');

  options = options || {};
  // options.inverse = options.inverse || inferType(this),

  // Metadata about relationships is stored on the meta of
  // the relationship. This is used for introspection and
  // serialization. Note that `key` is populated lazily
  // the first time the CP is called.
  var meta = {
    type: type,
    isRelationship: true,
    options: options,
    kind: 'hasMany',
    key: null
  };
  
  return computed(function(key, value) {
    var relationKey = hasManyKey(type),
      inverseType = options.inverse || inferType(this).camelize(),
      recordArray,
      recordIds;

    if (arguments.length > 1) {
      // TODO 
      throw new Error(
        'You can not call set on `' + pluralize(type) + '` because it is a hasMany relation. Use addObject/removeObject instead.'
      );
    }

    if (!this.get(relationKey)) {
      this.set(relationKey, []);
    }
    
    recordIds = this.get(relationKey)
    
    recordArray = RecordArray.create({
      content: recordIds,
      objectAtContent: function(idx) {
        var id = this.content.objectAt(idx);

        if (!id) {
          return;
        }

        return find(type, id);
      }
    });

    // records = findMany(type, this.get(relationKey));

    // TODO move into meta
    recordArray._type = inverseType;
    recordArray._record = this;

    return recordArray;
  }).meta(meta);
}

function belongsToKey(type) {
  return type.dasherize() + '_id';
}

function hasManyKey(type) {
  return type.dasherize() + '_ids';
}

function inferType(model) {
  return model.toString().split(':').without('')[1];
}

// TODO replace with ember-inflector
function pluralize(name) {
  return name + 's';
}

export default Model;

export {
  belongsToKey,
  belongsTo,
  hasManyKey,
  hasMany,
  inferType
};