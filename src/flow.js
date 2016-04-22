'use strict';

function checkIfInvalid (arrayToCheck, functionToCheck) {
    if (!arguments[0]) {
        return true;
    }

    if (Array.isArray(arrayToCheck)) {
        if (arguments.length === 1) { // если в массиве - функции
            arrayToCheck.forEach(function (item) {
                if (typeof item !== 'function') {
                    return true;
                }
            });

            return false;
        } else if (functionToCheck) {
            return typeof functionToCheck !== 'function';
        }

        return true;
    }

    return true;
}

function checkForCallback (arg) {
    if (arg && typeof arg === 'function') {
        return true;
    }
    return false;
}

// Функция serial запускает функции в массиве последовательно. Результат функции передается в
// следующую. Помимо результата предыдущей функции, она получает колбэк. Колбэк принимает первым
// параметром ошибку, а вторым – данные для следующей функции. Если любая из функций передает в
// колбэк ошибку, то следующая не выполняется, а вызывается основной колбэк callback
module.exports.serial = function (arrayOfFunctions, callback) {
    if (checkIfInvalid(arrayOfFunctions)) {
        callback(new Error('Неверные входные данные'), null);
        return;
    } else if (!checkForCallback(callback)) {
        throw new Error('Отсутствует callback');
    } else if (!arrayOfFunctions.length) {
        callback(null, null);
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
        callback(new Error('Неверные входные данные'), null);
        return;
    } else if (!checkForCallback(callback)) {
        throw new Error('Отсутствует callback');
    } else if (!arrayOfFunctions.length) {
        callback(null, null);
        return;
    }

    var counter = arrayOfFunctions.length;
    var results = [];
    var err = null;
    var next = function next(error, data) {
        if (error) {
            counter--;
            results.push(null);
            err = error;
            if (!counter) {
                next();
            }
        } else if (!counter) {
            callback(err, results);
        } else {
            counter--;
            results.push(data);
            if (!counter) {
                next();
            }
        }
    };

    arrayOfFunctions.forEach(function(func, i) {
        func(next);
    });
};

// Функция map запускает функцию с каждым значением параллельно. Переданная функция принимает
// значение из массива и колбэк. Результаты собираются в массив, который передается в
// основной колбэк при завершении всех запусков.
module.exports.map = function (arrayOfValues, func, callback) {
    if (checkIfInvalid(arrayOfValues, func)) {
        callback(new Error('Неверные входные данные'), null);
        return;
    } else if (!checkForCallback(callback)) {
        throw new Error('Отсутствует callback');
    } else if (!arrayOfValues.length) {
        callback(null, null);
        return;
    }

    var counter = arrayOfValues.length;
    var results = [];
    var err = null;
    var next = function next(error, data) {
        if (error) {
            counter--;
            results.push(null);
            err = error;
            if (!counter) {
                next();
            }
        } else if (!counter) {
            callback(err, results);
        } else {
            counter--;
            results.push(data);
            if (!counter) {
                next();
            }
        }
    };

   arrayOfValues.forEach(function(value, i) {
       func(value, next);
    });
};
