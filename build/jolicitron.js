"use strict";
var _ = require("lodash");
var _a = require("./parsers"), int = _a.int, array = _a.array, object = _a.object, merged = _a.merged;
// const {hash, queue} = require("./memory")
var memory_1 = require("./memory");
module.exports = build;
function build(builder) {
    var _a = memory_1.queue(), enqueue = _a.enqueue, dequeue = _a.dequeue;
    var _b = memory_1.hash(), get = _b.get, set = _b.set;
    var n = _.partial(deferredKeyArrayPair, function (name) { return name ? get(name)() : dequeue(); });
    var save = function (name) { return extract(int(), name ? set(name) : _.noop, enqueue); };
    return fromKeysOrParsers(builder(save, n));
}
function deferredKeyArrayPair(lengthSupplier, storageKey, options) {
    var keysOrParsers = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        keysOrParsers[_i - 3] = arguments[_i];
    }
    if (!_.isObjectLike(options)) {
        if (options || keysOrParsers.length > 0)
            keysOrParsers.unshift(options);
        options = { indices: false };
    }
    var parser = fromKeysOrParsers(keysOrParsers);
    var length = function () { return lengthSupplier(options.length); }; // length only available at parsing time
    return function (str) { return keyArrayPair(storageKey, length(), parser, options)(str); };
}
function keyArrayPair(key, length, parser, options) {
    return object([key], array(length, parser, options));
}
function fromKeysOrParsers(keysOrParsers) {
    if (keysOrParsers.length === 0)
        return int();
    else
        return merged(_.map(keysOrParsers, fromKeyOrParser));
}
function fromKeyOrParser(keyOrParser) {
    return _.isString(keyOrParser) ? fromKey(keyOrParser) : keyOrParser;
}
function fromKey(key) {
    return object([key], int());
}
function feed(parserFactory, feeder) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return function (str) { return parserFactory.apply(void 0, [feeder()].concat(args))(str); };
    };
}
function extract(parser) {
    var extractors = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        extractors[_i - 1] = arguments[_i];
    }
    return function (str) { return _.tap(parser(str), function (_a) {
        var parsedValue = _a.parsedValue;
        return _.each(extractors, function (extractor) { return extractor(parsedValue); });
    }); };
}
