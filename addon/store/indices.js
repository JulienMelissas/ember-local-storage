import Ember from 'ember';
import StorageArray from '../local/array';
import { find } from '../store';

var indices = new Ember.Map();

function createIndex(type) {
  var Index = StorageArray.extend({
      storageKey: type + '-index',
      initialContent: [],

      objectAtContent: function(idx) {
        var id = this.content.objectAt(idx);

        if (!id) {
          return;
        }

        return find(type, id);
      }
    }),
    index = Index.create();

  indices.set(type, index);
}

function addToIndex(type, id) {
  if (!indices.has(type)) {
    createIndex(type);
  }

  indices.get(type).addObject(id);
}

function deleteFromIndex(type, id) {
  if (!indices.has(type)) {
    createIndex(type);
  }

  indices.get(type).get('content').removeObject(id);
  indices.get(type).save();
}

function getFromIndex(type) {
  if (!indices.has(type)) {
    createIndex(type);
  }

  return indices.get(type);
}

function existsInIndex(type, id) {
  var index;

  if (!indices.has(type)) {
    createIndex(type);
  }

  index = indices.get(type).get('content');
  return index.contains(id) ? true : false;
}

export default indices;

export {
  createIndex,
  addToIndex,
  deleteFromIndex,
  getFromIndex,
  existsInIndex
};