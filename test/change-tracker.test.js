'use strict';

const chai = require('chai');
const expect = chai.expect;
const ChangeTracker = require('../lib/change-tracker');

describe('ChangeTracker', function() {
  describe('#add', function() {
    context('when adding an element with a new name', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.add('loc', 'London', done);
      });

      it('adds the set update', function() {
        expect(tracker.sets).to.deep.equal({ loc: 'London' });
      });

      it('updates the current copy', function() {
        expect(tracker.doc.loc).to.equal('London');
      });
    });

    context('when adding an element with empty field and values', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.add('', '', done);
      });

      it('does not add the set update', function() {
        expect(tracker.sets).to.deep.equal({});
      });

      it('updates the current copy', function() {
        expect(tracker.doc['']).to.equal('');
      });
    });

    context('when adding an element with an existing name', function() {
      context('when the existing name is in the original', function() {
        var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
        var tracker = new ChangeTracker(doc);

        it('sets an error in the callback', function(done) {
          tracker.add('name', 'APX', function(error) {
            expect(error.message).to.equal('A field with the name "name" already exists.');
            done();
          });
        });

        it('does not add a set to the update', function(done) {
          tracker.add('name', 'APX', function() {
            expect(tracker.sets).to.deep.equal({});
            done();
          });
        });
      });

      context('when the existing name was previously added', function() {
        var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
        var tracker = new ChangeTracker(doc);

        before(function(done) {
          tracker.add('loc', 'London', done);
        });

        it('sets an error in the callback', function(done) {
          tracker.add('loc', 'Essex', function(error) {
            expect(error.message).to.equal('A field with the name "loc" already exists.');
            done();
          });
        });

        it('contains the set from the first update', function(done) {
          tracker.add('loc', 'Essex', function() {
            expect(tracker.sets).to.deep.equal({ loc: 'London' });
            done();
          });
        });
      });
    });
  });

  describe('#get filter', function() {
    var doc = { _id: 'aphex-twin' };
    var tracker = new ChangeTracker(doc);

    it('returns the filter with the document _id', function() {
      expect(tracker.filter).to.deep.equal({ _id: doc._id });
    });
  });

  describe('#remove', function() {
    context('when the element is in the original document', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.remove('label', done);
      });

      it('removes the element from the document', function() {
        expect(tracker.doc).to.not.have.property('label');
      });

      it('adds the unset to the update', function() {
        expect(tracker.unsets).to.deep.equal({ label: '' });
      });
    });

    context('when removing an element that was added', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.update('label', 'Warp', function() {
          tracker.remove('label', done);
        });
      });

      it('removes the element from the document', function() {
        expect(tracker.doc).to.not.have.property('label');
      });

      it('does not add an unset to the update', function() {
        expect(tracker.unsets).to.deep.equal({});
      });

      it('does not add a set to the update', function() {
        expect(tracker.sets).to.deep.equal({});
      });
    });
  });

  describe('#rename', function() {
    context('when renaming to an element with an existing name', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      it('sets an error in the callback', function(done) {
        tracker.rename('', 'name', function(error) {
          expect(error.message).to.equal('A field with the name "name" already exists.');
          done();
        });
      });

      it('does not add a set to the update', function(done) {
        tracker.rename('', 'name', function() {
          expect(tracker.sets).to.deep.equal({});
          done();
        });
      });
    });

    context('when the element does not yet exist', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.add('', '', function() {
          tracker.rename('', 'label', done);
        });
      });

      it('adds the set update', function() {
        expect(tracker.sets).to.deep.equal({ label: '' });
      });

      it('updates the current copy', function() {
        expect(tracker.doc.label).to.equal('');
      });

      it('removes the old field from the document', function() {
        expect(tracker.doc).to.not.have.property('');
      });
    });
  });

  describe('#update', function() {
    context('when the updated value is the same', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.update('label', 'Warp', done);
      });

      it('makes no modifications', function() {
        expect(tracker.sets).to.deep.equal({});
      });
    });

    context('when the updated value is different', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.update('label', 'Ninja Tune', done);
      });

      it('adds the set update', function() {
        expect(tracker.sets).to.deep.equal({ label: 'Ninja Tune' });
      });

      it('updates the current copy', function() {
        expect(tracker.doc.label).to.equal('Ninja Tune');
      });
    });

    context('when updating a previously added value', function() {
      var doc = { _id: 'aphex-twin', name: 'Aphex Twin', label: 'Warp' };
      var tracker = new ChangeTracker(doc);

      before(function(done) {
        tracker.add('loc', 'London', function() {
          tracker.update('loc', 'Brighton', done);
        });
      });

      it('adds the set update', function() {
        expect(tracker.sets).to.deep.equal({ loc: 'Brighton' });
      });

      it('updates the current copy', function() {
        expect(tracker.doc.loc).to.equal('Brighton');
      });
    });
  });
});
