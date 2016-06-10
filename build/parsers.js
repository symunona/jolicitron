"use strict";
// const _ = require("lodash")
var _ = require("lodash");
var assert = require("assert");
module.exports = parserify({ int: int, array: array, object: object, merged: merged, tuple: tuple });
function parserify(parsers) {
    return _.mapValues(parsers, function (parser) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return function (str) { return parser.apply(void 0, [str].concat(args)); };
    }; });
}
function int(str) {
    var parsedValue = parseInt(str);
    assert(_.isInteger(parsedValue), "expected int but found '" + str + "'");
    var remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length);
    return { parsedValue: parsedValue, remaining: remaining };
}
function array(str, length, itemParser, _a) {
    var indices = (_a === void 0 ? { indices: false } : _a).indices;
    assert(_.isInteger(length), "array(): expected parameter 'length' to be an integer but found " + length);
    var parsers = _.times(length, _.constant(itemParser));
    var _b = tuple(str, parsers), parsedValue = _b.parsedValue, remaining = _b.remaining;
    return { parsedValue: indices ? indexed(parsedValue) : parsedValue, remaining: remaining };
    function indexed(array) {
        return _.map(array, function (item, index) {
            return _.assign({ index: index }, item);
        });
    }
}
function object(str, keys, valueParser) {
    var _a = array(str, keys.length, valueParser), values = _a.parsedValue, remaining = _a.remaining;
    var parsedValue = _.zipObject(keys, values);
    return { parsedValue: parsedValue, remaining: remaining };
}
function merged(str, parsers) {
    var _a = tuple(str, parsers), parsedValue = _a.parsedValue, remaining = _a.remaining;
    return { parsedValue: _.reduce(parsedValue, _.merge, {}), remaining: remaining };
}
function tuple(str, parsers) {
    return _.reduce(parsers, function (_a, parser) {
        var previousParsedValue = _a.parsedValue, previousRemaining = _a.remaining;
        var _b = parser(previousRemaining), parsedValue = _b.parsedValue, remaining = _b.remaining;
        var nextParsedValue = previousParsedValue.concat([parsedValue]);
        var nextRemaining = _.trimStart(remaining);
        return { parsedValue: nextParsedValue, remaining: nextRemaining };
    }, { parsedValue: [], remaining: str });
}
