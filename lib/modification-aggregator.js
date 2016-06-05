'use strict';

const cloneDeep = require('lodash.clonedeep');

/**
 * Aggregates modifications to a document and provides the update
 * document to pass to MongoDB.
 */
class ModificationAggregator {

  /**
   * Instantiate the aggregator with the original document.
   *
   * @param {Document} original - The original document.
   */
  constructor(original) {
    this.original = original;
    this.current = cloneDeep(original);
    this.sets = {};
    this.unsets = {};
  }

  /**
   * Add a new element. If the element does not already exist, it will be added.
   * Otherwise an error will be returned in the callback.
   *
   * @param {String} field - The name of the field to add.
   * @param {Object} value - The value of the element.
   * @param {Function} callback - The callback.
   */
  add(field, value, callback) {
    if (this.current.hasOwnProperty(field)) {
      return callback(new Error(`A field with the name "${field}" already exists.`));
    }
    this.current[field] = value;
    this.sets[field] = value;
    callback(null);
  }
}

module.exports = ModificationAggregator;
