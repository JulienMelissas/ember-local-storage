import StorageArray from '../local/array';

var registry;

registry = StorageArray.create({
  storageKey: 'ls-registry',
  initialContent: []
});

function addToRegistry(type, id) {
  if (!registry.contains(type)) {
    registry.addObject(type);
  }
}

export default registry;

export {
  addToRegistry
};