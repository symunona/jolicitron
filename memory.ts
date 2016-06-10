"use strict"

export function queue() {
  const queue = []
  return {
    dequeue() {
      if (0 in queue) return queue.shift()
      else throw new Error("no more value to dequeue")
    },
    enqueue: value => queue.push(value),
  }
}

export function hash() {
  const hash = {}
  return {
    get: key => () => {
      if (key in hash) return hash[key]
      else throw new Error(`unknown name "${key}"`)
    },
    set: key => value => hash[key] = value,
  }
}
