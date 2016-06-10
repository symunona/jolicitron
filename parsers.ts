"use strict"

// const _ = require("lodash")
import * as _ from "lodash"
const assert = require("assert")

export interface ParserFactory2<T> {
  (str: string, ...args): Parser<T>
}

export interface ParserFactory<T> {
  (...args): Parser<T>
}
export interface Parser<T> {
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

// export const int = () => str => int2(str)

export const int: ParserFactory<number> = () => str => {
  const parsedValue = parseInt(str)
  assert(_.isInteger(parsedValue), `expected int but found '${str}'`)
  const remaining = str.substring(str.indexOf(parsedValue.toString()) + parsedValue.toString().length)
  return {parsedValue, remaining}
}

interface ArrayParserFactory { <T>(length: number, itemParser: Parser<T>, options: ArrayParserFactoryOptions): Parser<T[]> }
interface ArrayParserFactoryOptions { indices: boolean }
export const array: ArrayParserFactory = <T>(length, itemParser, {indices} = {indices: false}) => str => {
  assert(_.isInteger(length), `array(): expected parameter 'length' to be an integer but found ${length}`)
  const parsers = _.times(length, _.constant(itemParser))
  const {parsedValue, remaining} = tuple(str, parsers)
  return {parsedValue: indices ? indexed(parsedValue) : parsedValue, remaining}


}

function array<T>(length: number, itemParser: Parser<T>, {indices} = {indices: false}): Parser<T[]> {
  const parsers = _.times(length, _.constant(itemParser))
  return tuple(parsers).map(indices ? indexed : _.noop)
  // return str => {
    // const {parsedValue, remaining} = tuple(str, parsers)
    // return {parsedValue: indices ? indexed(parsedValue) : parsedValue, remaining}
  // }

  function indexed(array) {
    return _.map(array, (item, index) => {
      return _.assign({index}, item)
    })
  }
}

function object<T>(str: string, keys: string[], valueParser: Parser<T>): ParserResult<{}> {
  return array(keys.length, valueParser).map(_.zipObject(keys))
  // const {parsedValue: values, remaining} = array(str, keys.length, valueParser)
  // const parsedValue = _.zipObject(keys, values)
  // return {parsedValue, remaining}
}

function merged(str: string, parsers: Parser<{}>[]): ParserResult<{}> {
  // const {parsedValue, remaining} = tuple(str, parsers)
  // return {parsedValue: _.reduce(parsedValue, _.merge, {}), remaining}
  return tuple(parsers).map(_.reduce(_.merge, {}))
}

function tuple(str: string, parsers: Parser<any>[]): ParserResult<any[]> {
  return _.reduce(parsers, ({parsedValue: previousParsedValue, remaining: previousRemaining}, parser) => {
    const {parsedValue, remaining} = parser(previousRemaining)
    const nextParsedValue = previousParsedValue.concat([parsedValue])
    const nextRemaining = _.trimStart(remaining)
    return {parsedValue: nextParsedValue, remaining: nextRemaining}
  }, {parsedValue: [], remaining: str})
}
