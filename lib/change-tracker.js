'use strict';

/**
 * Aggregates modifications to a document and provides the update
 * document to pass to MongoDB.
 */
class ChangeTracker {

  /**
   * Instantiate the change tracker with the original document.
   *
   * @param {Document} doc - The document to modify.
   */
  constructor(doc) {
    this.doc = doc;
    this.sets = {};
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
    this._validateFieldName(field, (error) => {
      if (error) {
        return callback(error);
      }
      this._setElement(field, value);
      callback(null);
    });
  }

  /**
   * Renames a field in the document to another name.
   *
   * @param {String} oldName - The old field name.
   * @param {String} newName - The new field name.
   * @param {Function} callback - The callback.
   */
  rename(oldName, newName, callback) {
    this._validateFieldName(newName, (error) => {
      if (error) {
        return callback(error);
      }
      var value = this.doc[oldName];
      delete this.doc[oldName];
      this._setElement(newName, value);
      callback(null);
    });
  }

  /**
   * Update an existing element in the document. This can be an original element
   * or a modification of an element that was added to the document.
   *
   * @param {String} field - The name of the field.
   * @param {Object} value - The value of the element.
   * @param {Function} callback - The callback.
   */
  update(field, value, callback) {
    if (this.doc[field] !== value) {
      this._setElement(field, value);
    }
    callback(null);
  }

  /**
   * Sets the element in the sets hash and in the current document.
   *
   * @param {String} field - The field.
   * @param {Object} value - The value.
   */
  _setElement(field, value) {
    this.doc[field] = value;
    // Adding a new empty field when editing must not add set operations.
    if (field.length !== 0) {
      this.sets[field] = value;
    }
  }

  _validateFieldName(field, callback) {
    if (this.doc.hasOwnProperty(field)) {
      return callback(new Error(`A field with the name "${field}" already exists.`));
    }
    return callback(null);
  }
}

module.exports = ChangeTracker;
