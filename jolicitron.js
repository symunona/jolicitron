"use strict"

const _ = require("lodash")
const p = require("./parser")
const {int, array, object, merge} = require("./parsers")
const {hash, queue} = require("./memory")

module.exports = build

function build(builder) {
  const {enqueue, dequeue} = queue()
  const {get, set} = hash()
  const n = _.partial(deferredKeyArrayPair, name => name ? get(name)() : dequeue())
  const save = name => extract(int(), name ? set(name) : _.noop, enqueue)
  return fromKeysOrParsers(builder(save, n))
}

const deferredKeyArrayPair = lengthSupplier => (storageKey, options, ...keysOrParsers) => {
  if (!_.isObjectLike(options)) { // if no options were provided
    if (options || keysOrParsers.length > 0) keysOrParsers.unshift(options)
    options = {indices: false}
  }
  const parser = fromKeysOrParsers(keysOrParsers)
  const length = () => lengthSupplier(options.length) // length only available at parsing time
  return str => namedArray(storageKey, length(), parser, options)(str)
}

function namedArray(key, length, parser, options) {
  return object([key], array(length, parser, options))
}

const fromKeysOrParsers = _.cond([
  [_.isEmpty, int],
  [() => true, _.map(fromKeyOrParser)],
])

const fromKeyOrParser = _.cond([
  [_.isString, named(int())],
  [() => true, _.identity],
])

const fromKey = key => object([key], int())

const named = parser => name => object([name], parser)

function fromKeysOrParsers(keysOrParsers) {
  if (keysOrParsers.length === 0) return int()
  else return merge(_.map(keysOrParsers, fromKeyOrParser))
}

function fromKeyOrParser(keyOrParser) {
  return _.isString(keyOrParser) ? fromKey(keyOrParser) : keyOrParser
}

function fromKey(key) {
  return object([key], int())
}

function extract(parser, ...extractors) {
  const extractToAll = parsedValue => _.each(extractors, extractor => extractor(parsedValue))
  return p.map(extractToAll)(parser)
}
