import Ember from 'ember';

var cache = new Ember.Map();

function addToCache(key, record) {
  cache.set(key, record);
}

function deleteFromCache(key) {
  cache.delete(key);
}

function getFromCache(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
}

export default cache;

export {
  addToCache,
  deleteFromCache,
  getFromCache
};