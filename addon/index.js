import Model from './store/model';
import attr from './store/attributes';
import {
  belongsTo,
  hasMany
} from './store/relationships';

export default {
  Model: Model,
  attr: attr,
  belongsTo: belongsTo,
  hasMany: hasMany
};