"use strict"

const fp = require("lodash/fp")
const assert = require("assert")
const p = require("./parser")

const int = () => str => {
  const parsedValue = parseInt(str)
  assert(fp.isInteger(parsedValue), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

function array(length, itemParser, {indices} = {indices: false}) {
  assert(fp.isInteger(length), `array(): expected parameter 'length' to be an integer but found ${length}`)
  const indexed = fp.map((item, index) => fp.assign({index}, item))
  return fp.flow(p.repeat(length), p.map(indices ? indexed : () => {}))(itemParser)
}

function object(keys, valueParser) {
  return p.map(fp.zipObject(keys))(array(keys.length, valueParser))
}

function merge(parsers) {
  return p.map(fp.reduce(fp.merge, {}))(p.chain(parsers))
}

module.exports = {int, array, object, merge}
