import Ember from 'ember';
import {
  belongsToKey,
  hasManyKey,
  inferType
} from './relationships';

export default Ember.ArrayProxy.extend(Ember.MutableArray, {
  content: [],
  addObject: function(object) {
    // TODO refactor remove _type and get it from _record
    var relationKey = hasManyKey(inferType(object)),
      ids;

    if (object.get(belongsToKey(this._type)) !== this._record.get('id')) {
      object.set(this._type, this._record);
    }

    if (!this._record.get(relationKey).contains(object.get('id'))) {
      this._record.get(relationKey).addObject(object.get('id'));
    }

    return this._super.apply(this, arguments);
  },

  removeObject: function(object) {
    var relationKey = hasManyKey(inferType(object)),
      ids;

    if (object.get(belongsToKey(this._type)) !== null) {
      object.set(this._type, null);
    }

    console.log('grr', this);
    if (this.get('content').contains(object.get('id'))) {
      this.get('content').removeObject(object.get('id'));
      console.log('fuck', this._record.get(relationKey));
      
      this._record.save();
    }

    return this._super.apply(this, arguments);
  }
})