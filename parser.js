"use strict"

const fp = require("lodash/fp")

// type Parser a = string => a

// [Parser *] => Parser [*]
const chain = fp.reduce((a, b) => str => {
  const {parsedValueFromA, remainingAfterA} = a(str)
  const {parsedValueFromB, remainingAfterB} = b(remainingAfterA)
  return {
    parsedValue: [parsedValueFromA, parsedValueFromB],
    remaining: fp.trimStart(remainingAfterB)
  }
})

// number => Parser a => Parser [a]
function repeat(n) {
  return parser => chain(fp.times(() => parser, n))
}

// (a => b) => Parser a => Parser b
function map(f) {
  return parser => str => {
    const {parsedValue, remaining} = parser(str)
    return {parsedValue: f(parsedValue), remaining}
  }
}

// (a => *) => Parser a => Parser a
function tap(f) {
  return parser => str => {
    const parserResult = parser(str)
    f(parserResult)
    return parserResult
  }
}

module.exports = {chain, repeat, map, tap}
