"use strict"

import * as fp from "lodash/fp"

export interface Parser<T> {
  (str: string): ParserResult<T>
}

export interface ParserResult<T> {
  parsedValue: T,
  remaining: string,
}

// (a => b) => Parser a => Parser b
export function map<T, R>(f: (t: T) => R): (parser: Parser<T>) => Parser<R>
export function map(f) {
  return parser => str => {
    const {parsedValue, remaining} = parser(str)
    return {parsedValue: f(parsedValue), remaining}
  }
}

// export const map: <T, R>(f: (t: T) => R) => (parser: Parser<T>) => Parser<R>
// export const map = f => parser => str => {
//   const {parsedValue, remaining} = parser(str)
//   return {parsedValue: f(parsedValue), remaining}
// }

export const chain: (parsers: Parser<any>[]) => Parser<any[]> = fp.reduce((a, b) => str => {
  const {parsedValueFromA, remainingAfterA} = a(str)
  const {parsedValueFromB, remainingAfterB} = b(remainingAfterA)
  return {
    parsedValue: [parsedValueFromA, parsedValueFromB],
    remaining: fp.trimStart(remainingAfterB)
  }
})

export function repeat(n): <T>(parser: Parser<T>) => Parser<T[]> {
  return parser => chain(fp.times(() => parser, n))
}