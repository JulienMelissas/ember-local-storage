import Ember from 'ember';
import Model from './model';

var get = Ember.get;

Model.reopenClass({
  attributes: Ember.computed(function() {
    var map = Ember.Map.create();

    this.eachComputedProperty(function(name, meta) {
      if (meta.isAttribute) {
        Ember.assert('You may not set `id` as an attribute on your model. Please remove any lines that look like: `id: LS.attr("<type>")` from ' + this.toString(), name !== 'id');

        meta.name = name;
        map.set(name, meta);
      }
    });

    return map;
  }).readOnly(),

  eachAttribute: function(callback, binding) {
    get(this, 'attributes').forEach(function(meta, name) {
      callback.call(binding, name, meta);
    }, binding);
  }
});

Model.reopen({
  eachAttribute: function(callback, binding) {
    this.constructor.eachAttribute(callback, binding);
  }
});

function getDefaultValue(record, options, key) {
  if (typeof options.defaultValue === 'function') {
    return options.defaultValue.apply(null, arguments);
  } else {
    return options.defaultValue;
  }
}

function hasValue(record, key) {
  return record.content.hasOwnProperty(key);
}

function getValue(record, key) {
  return record.content[key];
}

function setValue(record, key, value) {
  record.set('content.' + key, value);
}

export default function attr(type, options) {
  if (typeof type === 'object') {
    options = type;
    type = undefined;
  } else {
    options = options || {};
  }

  var meta = {
    type: type,
    isAttribute: true,
    options: options
  };

  return Ember.computed(function(key, value) {
    if (arguments.length > 1) {
      Ember.assert('You may not set `id` as an attribute on your model. Please remove any lines that look like: `id: LS.attr('<type>')` from ' + this.constructor.toString(), key !== 'id');

      setValue(this, key, value);

      return value;
    } else if (hasValue(this, key)) {
      return getValue(this, key);
    } else {
      return getDefaultValue(this, options, key);
    }
  }).meta(meta);
}