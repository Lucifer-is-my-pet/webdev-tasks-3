'use strict';

function checkIfInvalid(arrayToCheck, functionToCheck) {
    if (!arguments[0]) {
        return true;
    }
    var isNotArrayOrEmpty = Object.getPrototypeOf(arrayToCheck) !== Array.prototype ||
        !arrayToCheck.length;
    if (!isNotArrayOrEmpty) { // если с массивом снаружи всё норм
        if (arguments.length === 1) { // если в массиве - функции
            for (var i in arrayToCheck) {
                if (Object.getPrototypeOf(arrayToCheck[i]) !== Function.prototype) {
                    return true;
                }
            }
            return false;
        } else if (functionToCheck) {
            return Object.getPrototypeOf(functionToCheck) !== Function.prototype;
        }
        return true;
    }
    return isNotArrayOrEmpty;
}

// Функция serial запускает функции в массиве последовательно. Результат функции передается в
// следующую. Помимо результата предыдущей функции, она получает колбэк. Колбэк принимает первым
// параметром ошибку, а вторым – данные для следующей функции. Если любая из функций передает в
// колбэк ошибку, то следующая не выполняется, а вызывается основной колбэк callback
module.exports.serial = function (arrayOfFunctions, callback) {
    if (checkIfInvalid(arrayOfFunctions)) {
        callback(new Error(), null);
        return;
    }
    var nextFunction = arrayOfFunctions.shift();
    var counter = arrayOfFunctions.length;
    var next = function next(error, data) {
        if (error) {
            callback(error);
        } else if (!counter) {
            callback(null, data);
        } else {
            counter--;
            nextFunction = arrayOfFunctions.shift();
            nextFunction(data, next);
        }
    };
    nextFunction(next);
};

// Функция parallel запускает функции в массиве параллельно. Результаты собираются в массив,
// который передается в основной колбэк при завершении всех функций. Функции принимают колбэк.
// Колбэк принимает первым параметром ошибку, а вторым – данные для конечного массива.
module.exports.parallel = function (arrayOfFunctions, callback) {
    if (checkIfInvalid(arrayOfFunctions)) {
        callback(new Error(), null);
        return;
    }
    var counter = arrayOfFunctions.length;
    var results = [];
    var next = function next(error, data) {
        if (error) {
            counter--;
            callback(error);
        } else if (!counter) {
            callback(null, results);
        } else {
            counter--;
            results.push(data);
            if (!counter) {
                next();
            }
        }
    };
    for (var i in arrayOfFunctions) {
        arrayOfFunctions[i](next);
    }
};

// Функция map запускает функцию с каждым значением параллельно. Переданная функция принимает
// значение из массива и колбэк. Результаты собираются в массив, который передается в
// основной колбэк при завершении всех запусков.
module.exports.map = function (arrayOfValues, func, callback) {
    if (checkIfInvalid(arrayOfValues, func)) {
        callback(new Error(), null);
        return;
    }
    var counter = arrayOfValues.length;
    var results = [];
    var next = function next(error, data) {
        if (error) {
            counter--;
            callback(error);
        } else if (!counter) {
            callback(null, results);
        } else {
            counter--;
            results.push(data);
            if (!counter) {
                next();
            }
        }
    };
    for (var i in arrayOfValues) {
        func(arrayOfValues[i], next);
    }
};
