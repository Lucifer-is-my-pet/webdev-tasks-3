const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Serial', function() {
    it('should return null on empty argument', function() {
        var result = flow.serial();
        assert.equal(result, null);
    });

    it('should return null on null argument', function() {
        var result = flow.serial(null);
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

    it('should return null on empty array', function() {
        var result = flow.serial([]);
        assert.equal(result, null);
    });

    function testFunc1 (next) {
        next(null, 100);
    }
    function testFunc2 (data, next) {
        next(new Error(), data);
    }
    function testFunc3 (data, next) {
        next(null, data * 2);
    }
    it('should return error', function() {
        var spy = sinon.spy();
        flow.serial([testFunc1, testFunc2, testFunc3], spy);
        assert.equal(spy.calledWith(Error()), true);
    });

    it('should call functions serially', function() {
        var spy = sinon.spy();
        flow.serial([testFunc1, testFunc3], spy);
        assert.equal(spy.calledWith(null, 200), true);
    });
});

describe('Parallel', function() {
    function testFunc1 () {
        return 100;
    }
    function testFunc2 (next) {
        next(new Error());
    }
    function testFunc3 (next) {
        next(null, 'test text');
    }
    it('should return error', function() {
        var spy = sinon.spy();
        flow.parallel([testFunc1, testFunc2, testFunc3], spy);
        assert.equal(spy.calledWith(Error()), true);
    });

    it('should call functions parallel', function() {
        var spy = sinon.spy();
        function testFunc4 () {
            setTimeout(spy, 2000);
        }
        function testFunc5 () {
            setTimeout(spy, 2000);
        }
        var fakeTimer = sinon.useFakeTimers();
        flow.parallel([testFunc4, testFunc5]);
        fakeTimer.tick(2000);
        assert.equal(spy.calledTwice, true);
        fakeTimer.restore();
    });
});

describe('Map', function() {
    var testArray = [0, 10];

    it('should return null on empty second argument', function() {
        var result = flow.map(testArray);
        assert.equal(result, null);
    });

    it('should return null on wrong second argument', function() {
        var result = flow.map(testArray, testArray);
        assert.equal(result, null);
    });

    it('should return null on null second argument', function() {
        var result = flow.map(testArray, null);
        assert.equal(result, null);
    });

    function testFunc1 (data, next) {
        next(null, data + 1);
    }
    it('should apply function to array', function() {
        var spy = sinon.spy();
        flow.map(testArray, testFunc1, spy);
        assert.equal(spy.calledWith(null, [1, 11]), true);
    });

    function testFunc2 (data, next) {
        next(new Error(), data);
    }
    it('should return error', function() {
        var spy = sinon.spy();
        flow.map(testArray, testFunc2, spy);
        assert.equal(spy.calledWith(Error()), true);
    });

});
