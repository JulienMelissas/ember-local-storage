import Ember from 'ember';

import DebugAdapter from './store/debug';

import {
  addToRegistry
} from './store/registry';

import {
  addToCache,
  deleteFromCache,
  getFromCache
} from './store/cache';

import {
  createIndex,
  addToIndex,
  deleteFromIndex,
  getFromIndex,
  existsInIndex
} from './store/indices';

var appContainer;

function generateId() {
  return Math.random().toString(32).slice(2).substr(0, 5);
}

function generateStorageKey(type, id) {
  return type + '-' + id;
}

// TODO doc block
function find(type, id) {
  var storageKey = generateStorageKey(type, id),
    exists = existsInIndex(type, id),
    record,
    model;

  if (!exists) {
    throw new Error(
      'Could not find record of type `' + type + '` with id `' + id + '`'
    );
  }

  record = getFromCache(storageKey);

  if (!record) {
    model = appContainer.lookupFactory('model:' + type);

    record = model.create({
      id: id,
      storageKey: storageKey
    });

    addToRegistry(type, id);
    addToCache(storageKey, record);
  }

  return record;
}

// TODO doc block
function findMany(type, ids) {
  return ids.map(function(id) {
    return find(type, id);
  });
}

// TODO doc block
function findAll(type) {
  return getFromIndex(type);
}

// TODO doc block
function createRecord(type, attrs) {
  var id = generateId(),
    storageKey = generateStorageKey(type, id),
    model = appContainer.lookupFactory('model:' + type),
    record;

  attrs = attrs || {};

  record = model.create({
    id: id,
    storageKey: storageKey,
    _attributes: Ember.merge(attrs, {id: id})
  });

  addToRegistry(type, id);
  addToCache(storageKey, record);
  addToIndex(type, id);

  return record;
}

// TODO doc block
function deleteRecord(type, id) {
  var storageKey = generateStorageKey(type, id),
    record = find(type, id);

  record.clearRelationships();

  deleteFromCache(storageKey);
  deleteFromIndex(type, id);

  record.destroy();
}

export default function(container, application) {
  appContainer = container;

  return Ember.Object.extend({
    find: find,
    findMany: findMany,
    findAll: findAll,
    createRecord: createRecord,
    deleteRecord: deleteRecord,
    destroyRecord: deleteRecord
  });
}

export {
  find,
  findMany
};