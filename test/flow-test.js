'use strict';

const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Serial', function () {
    function testFunc1(data, next) {
        next = next || data;
        data = Object.getPrototypeOf(data) === Function.prototype ? 100 : data;
        setTimeout(function () {
            next(null, data + 100);
        }, 1000);
    }

    function testFunc2(data, next) {
        next = next || data;
        setTimeout(function () {
            next(new Error(), 250);
        }, 2000);
    }

    function testFunc3(data, next) {
        next = next || data;
        data = Object.getPrototypeOf(data) === Function.prototype ? 0 : data;
        setTimeout(function () {
            next(null, data * 2);
        }, 1000);
    }

    describe('Test for errors', function () {
        var fakeTimer;

        beforeEach(function () {
            fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });

        it('should return error after 1 function', function () {
            var spy = sinon.spy();

            flow.serial([testFunc2, testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
        });

        it('should return error after 2 function', function () {
            var spy = sinon.spy();

            flow.serial([testFunc1, testFunc2, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
        });

        it('should return error after 3 function', function () {
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
        });

        it('should call callback with error', function () {
            var spy = sinon.spy();

            flow.serial([], spy);
            assert.equal(spy.calledWith(null, null), true);
        });

        it('should throw error', function () {
            assert.throws(function() {
                flow.serial([testFunc1, testFunc3])
            }, Error);
        });
    });

    describe('Test for functionality', function () {
        var fakeTimer;

        beforeEach(function () {
            fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });

        it('should call functions serially 1', function () {
            var spy = sinon.spy();

            flow.serial([testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, 400), true);
        });

        it('should call functions serially 2', function () {
            var spy = sinon.spy();

            flow.serial([testFunc3, testFunc1], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, 100), true);
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
        var fakeTimer;

        beforeEach(function () {
             fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });

        it('should return null on error', function () {
            var spy = sinon.spy();

            flow.parallel([testFunc1, testFunc2, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, [null, 'test text', 100]), true);
            assert.equal(spy.calledOnce, true);
        });
    });

    describe('Test for functionality', function () {
        var fakeTimer;

        beforeEach(function () {
            fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });
        it('should call functions parallel', function () {
            var spy = sinon.spy();

            function testFunc4() {
                setTimeout(spy, 2000);
            }

            function testFunc5() {
                setTimeout(spy, 2000);
            }

            function callback(data) {
                return data;
            }

            flow.parallel([testFunc4, testFunc5], callback);
            fakeTimer.tick(1000);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledTwice, true);
        });

        it('should call functions parallel with result', function () {
            var spy = sinon.spy();

            flow.parallel([testFunc1, testFunc3], spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(2000);
            assert.equal(spy.calledWith(null, ['test text', 100]), true);
        });
    });
});

describe('Map', function () {
    var testArray = [0, -1, 99];

    describe('Test for errors', function () {
        var fakeTimer;
        beforeEach(function () {
            fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });
        it('should return error', function () {
            function testFunc1(data, next) {
                setTimeout(function () {
                    next(new Error(), data * 2);
                }, 1000);
            }

            var spy = sinon.spy();

            flow.map(testArray, testFunc1, spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(Error()), true);
            assert.equal(spy.calledWith(Error(), 0), false);
            assert.equal(spy.calledWith(Error(), -2), false);
            assert.equal(spy.calledWith(Error(), 198), false);
            assert.equal(spy.calledThrice, true);
        });
    });

    describe('Test for functionality', function () {
        var fakeTimer;

        beforeEach(function () {
            fakeTimer = sinon.useFakeTimers();
        });
        afterEach(function () {
            fakeTimer.restore();
        });
        it('should apply function to array', function () {
            function testFunc2(data, next) {
                setTimeout(function () {
                    next(null, data * 2);
                }, 1000);
            }

            var spy = sinon.spy();

            flow.map(testArray, testFunc2, spy);
            assert.equal(spy.called, false);
            fakeTimer.tick(1000);
            assert.equal(spy.calledWith(null, [0, -2, 198]), true);
        });
    });

});
