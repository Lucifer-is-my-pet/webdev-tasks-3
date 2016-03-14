const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Serial', function() {
    it('should return null on empty argument', function() {
        var result = flow.serial();
        assert.equal(result, null);
    });

    it('should return null on not array argument', function() {
        var result = flow.serial('some string');
        assert.equal(result, null);
    });

    it('should return null on wrong array', function() {
        var result = flow.serial([1, 0]);
        assert.equal(result, null);
    });

});

describe('Parallel', function() {

});

describe('Map', function() {
    function testFunc(data, next) {
        next(null, data + 1);
    }
    var testArray = [0, 10];

    it('should return null on empty second argument', function() {
        var result = flow.map(testArray);
        assert.equal(result, null);
    });

    it('should return null on wrong second argument', function() {
        var result = flow.map(testArray, testArray);
        assert.equal(result, null);
    });

    it('should apply function to array', function() {
        var spy = sinon.spy();
        flow.map(testArray, testFunc, spy);
        assert.equal(spy.calledWith(null, [1, 11]), true);
    });

});
