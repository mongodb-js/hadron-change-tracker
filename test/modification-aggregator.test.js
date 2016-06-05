'use strict';

const chai = require('chai');
const expect = chai.expect;
const ModificationAggregator = require('../lib/modification-aggregator');

describe('ModificationAggregator', function() {
  var doc = {
    _id: 'aphex-twin',
    name: 'Aphex Twin',
    label: 'Warp',
    members: [ 'Richard James' ]
  };

  describe('#add', function() {
    context('when adding an element with a new name', function() {
      var aggregator = new ModificationAggregator(doc);

      before(function(done) {
        aggregator.add('loc', 'London', done);
      });

      it('adds the set update', function() {
        expect(aggregator.sets).to.deep.equal({ loc: 'London' });
      });

      it('updates the current copy', function() {
        expect(aggregator.current.loc).to.equal('London');
      });

      it('does not modify the original', function() {
        expect(aggregator.original.loc).to.equal(undefined);
      });
    });

    context('when adding an element with an existing name', function() {
      context('when the existing name is in the original', function() {
        var aggregator = new ModificationAggregator(doc);

        it('sets an error in the callback', function(done) {
          aggregator.add('name', 'APX', function(error) {
            expect(error.message).to.equal('A field with the name "name" already exists.');
            done();
          });
        });

        it('does not add a set to the update', function(done) {
          aggregator.add('name', 'APX', function() {
            expect(aggregator.sets).to.deep.equal({});
            done();
          });
        });
      });

      context('when the existing name was previously added', function() {
        var aggregator = new ModificationAggregator(doc);

        before(function(done) {
          aggregator.add('loc', 'London', done);
        });

        it('sets an error in the callback', function(done) {
          aggregator.add('loc', 'Essex', function(error) {
            expect(error.message).to.equal('A field with the name "loc" already exists.');
            done();
          });
        });

        it('contains the set from the first update', function(done) {
          aggregator.add('loc', 'Essex', function() {
            expect(aggregator.sets).to.deep.equal({ loc: 'London' });
            done();
          });
        });
      });
    });
  });

  describe('#update', function() {
    context('when the updated value is the same', function() {
      var aggregator = new ModificationAggregator(doc);

      before(function(done) {
        aggregator.update('label', 'Warp', done);
      });

      it('makes no modifications', function() {
        expect(aggregator.sets).to.deep.equal({});
      });
    });

    context('when the updated value is different', function() {
      var aggregator = new ModificationAggregator(doc);

      before(function(done) {
        aggregator.update('label', 'Ninja Tune', done);
      });

      it('adds the set update', function() {
        expect(aggregator.sets).to.deep.equal({ label: 'Ninja Tune' });
      });

      it('updates the current copy', function() {
        expect(aggregator.current.label).to.equal('Ninja Tune');
      });

      it('does not modify the original', function() {
        expect(aggregator.original.label).to.equal('Warp');
      });
    });

    context('when updating a previously added value', function() {
      var aggregator = new ModificationAggregator(doc);

      before(function(done) {
        aggregator.add('loc', 'London', function() {
          aggregator.update('loc', 'Brighton', done);
        });
      });

      it('adds the set update', function() {
        expect(aggregator.sets).to.deep.equal({ loc: 'Brighton' });
      });

      it('updates the current copy', function() {
        expect(aggregator.current.loc).to.equal('Brighton');
      });

      it('does not modify the original', function() {
        expect(aggregator.original.loc).to.equal(undefined);
      });
    });
  });
});
