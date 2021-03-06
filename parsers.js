"use strict"

const _ = require("lodash")
const assert = require("assert")

module.exports = parserify({int, array, object, merged, tuple})

function parserify(parsers) {
  return _.mapValues(parsers, parser => (...args) => str => parser(str, ...args))
}

function int(str) {
  const parsedValue = parseInt(str)
  assert(_.isInteger(parsedValue), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

function array(str, length, itemParser, {indices} = {indices: false}) {
  assert(_.isInteger(length), `array(): expected parameter 'length' to be an integer but found ${length}`)
  const parsers = _.times(length, _.constant(itemParser))
  const {parsedValue, remaining} = tuple(str, parsers)
  return {parsedValue: indices ? indexed(parsedValue) : parsedValue, remaining}

  function indexed(array) {
    return _.map(array, (item, index) => {
      return _.assign({index}, item)
    })
  }
}

function object(str, keys, valueParser) {
  const {parsedValue: values, remaining} = array(str, keys.length, valueParser)
  const parsedValue = _.zipObject(keys, values)
  return {parsedValue, remaining}
}

function merged(str, parsers) {
  const {parsedValue, remaining} = tuple(str, parsers)
  return {parsedValue: _.reduce(parsedValue, _.merge, {}), remaining}
}

function tuple(str, parsers) {
  return _.reduce(parsers, ({parsedValue: previousParsedValue, remaining: previousRemaining}, parser) => {
    const {parsedValue, remaining} = parser(previousRemaining)
    const nextParsedValue = previousParsedValue.concat([parsedValue])
    const nextRemaining = _.trimStart(remaining)
    return {parsedValue: nextParsedValue, remaining: nextRemaining}
  }, {parsedValue: [], remaining: str})
}
