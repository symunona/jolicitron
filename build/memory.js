"use strict";
function queue() {
    var queue = [];
    return {
        dequeue: function () {
            if (0 in queue)
                return queue.shift();
            else
                throw new Error("no more value to dequeue");
        },
        enqueue: function (value) { return queue.push(value); }
    };
}
exports.queue = queue;
function hash() {
    var hash = {};
    return {
        get: function (key) { return function () {
            if (key in hash)
                return hash[key];
            else
                throw new Error("unknown name \"" + key + "\"");
        }; },
        set: function (key) { return function (value) { return hash[key] = value; }; }
    };
}
exports.hash = hash;
