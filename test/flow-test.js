'use strict';

const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Serial', function () {
    function testFunc1(data, next) {
        next = next || data;
        setTimeout(function () {
            next(null, 100);
        }, 1000);
    }

    function testFunc2(data, next) {
        next = next || data;
        setTimeout(function () {
            next(new Error(), data);
        }, 2000);
    }

    function testFunc3(data, next) {
        next = next || data;
        data = data || 0;
        setTimeout(function () {
            next(null, data * 2);
        }, 1000);
    }

    describe('Test for errors', function () {
        it('should return error after 1 function', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.serial([testFunc2, testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            fakeTimer.restore();
        });

        it('should return error after 2 function', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.serial([testFunc1, testFunc2, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            fakeTimer.restore();

        });

        it('should return error after 3 function', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.serial([testFunc1, testFunc3, testFunc2], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            fakeTimer.restore();
        });

        it('should call callback with error', function () {
            var spy = sinon.spy();
            flow.serial([], spy);
            assert.equal(spy.calledWith(Error(), null), true);
        });
    });

    describe('Test for functionality', function () {
        it('should call functions serially 1', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.serial([testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, 200), true);
            fakeTimer.restore();
        });

        it('should call functions serially 2', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.serial([testFunc3, testFunc1], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, 100), true);
            fakeTimer.restore();
        });
    });
});

describe('Parallel', function () {
    function testFunc1(next) {
        setTimeout(function () {
            next(null, 100);
        }, 2000);
    }

    function testFunc2(next) {
        setTimeout(function () {
            next(new Error(), 700);
        }, 1000);
    }

    function testFunc3(next) {
        setTimeout(function () {
            next(null, 'test text');
        }, 1000);
    }

    describe('Test for errors', function () {
        it('should return error', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.parallel([testFunc1, testFunc2, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, ['test text', 100]), true);
            assert.equal(spy.calledTwice, true);
            fakeTimer.restore();
        });
    });

    describe('Test for functionality', function () {
        it('should call functions parallel', function () {
            var spy = sinon.spy();

            function testFunc4() {
                setTimeout(spy, 2000);
            }

            function testFunc5() {
                setTimeout(spy, 2000);
            }

            var fakeTimer = sinon.useFakeTimers();
            flow.parallel([testFunc4, testFunc5]);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledTwice, true);
            fakeTimer.restore();
        });

        it('should call functions parallel with result', function () {
            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.parallel([testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(2000);
            assert.equal(spy.calledWith(null, ['test text', 100]), true);
            fakeTimer.restore();
        });
    });
});

describe('Map', function () {
    var testArray = [0, -1, 99];

    describe('Test for errors', function () {
        it('should return error', function () {
            function testFunc1(data, next) {
                setTimeout(function () {
                    next(new Error(), data * 2);
                }, 1000);
            }

            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.map(testArray, testFunc1, spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            assert.equal(spy.calledWith(Error(), 0), false);
            assert.equal(spy.calledWith(Error(), -2), false);
            assert.equal(spy.calledWith(Error(), 198), false);
            assert.equal(spy.calledThrice, true);
            fakeTimer.restore();
        });
    });

    describe('Test for functionality', function () {
        it('should apply function to array', function () {
            function testFunc2(data, next) {
                setTimeout(function () {
                    next(null, data * 2);
                }, 1000);
            }

            var fakeTimer = sinon.useFakeTimers();
            var spy = sinon.spy();
            flow.map(testArray, testFunc2, spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, [0, -2, 198]), true);
            fakeTimer.restore();
        });
    });

});
