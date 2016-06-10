"use strict"

// const _ = require("lodash")
import * as _ from "lodash"
const assert = require("assert")

interface Parser<T> {
  (str: string): ParserResult<T>
}

interface ParserResult<T> {
  parsedValue: T,
  remaining: string,
}

interface Indexed {
  index: number
}

interface Parsers {
  int: Parser<number>
}

const p = parserify({int, array, object, merged, tuple})
// export default int = 1

function parserify(parsers): Parsers {
  return _.mapValues(parsers, parser => (...args) => str => parser(str, ...args))
}

export function int(str): ParserResult<number> {
  const parsedValue = parseInt(str)
  assert(_.isInteger(parsedValue), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

function array<T>(str: string, length: number, itemParser: Parser<T>, {indices} = {indices: false}): ParserResult<T[]> {
  assert(_.isInteger(length), `array(): expected parameter 'length' to be an integer but found ${length}`)
  const parsers = _.times(length, _.constant(itemParser))
  const {parsedValue, remaining} = tuple(str, parsers)
  return {parsedValue: indices ? indexed(parsedValue) : parsedValue, remaining}

  function indexed(array): Indexed[] {
    return _.map(array, (item, index) => {
      return _.assign({index}, item) as Indexed
    })
  }
}

function object<T>(str: string, keys: string[], valueParser: Parser<T>): ParserResult<{}> {
  const {parsedValue: values, remaining} = array(str, keys.length, valueParser)
  const parsedValue = _.zipObject(keys, values)
  return {parsedValue, remaining}
}

function merged(str: string, parsers: Parser<{}>[]): ParserResult<{}> {
  const {parsedValue, remaining} = tuple(str, parsers)
  return {parsedValue: _.reduce(parsedValue, _.merge, {}), remaining}
}

function tuple(str: string, parsers: Parser<any>[]): ParserResult<any[]> {
  return _.reduce(parsers, ({parsedValue: previousParsedValue, remaining: previousRemaining}, parser) => {
    const {parsedValue, remaining} = parser(previousRemaining)
    const nextParsedValue = previousParsedValue.concat([parsedValue])
    const nextRemaining = _.trimStart(remaining)
    return {parsedValue: nextParsedValue, remaining: nextRemaining}
  }, {parsedValue: [], remaining: str})
}
