/*
    wwwroot/js/interactiveelement/taskqueue.js
    Version: 0.1.2
    (c) 2024, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Task Queue
    ==========
*/

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export const TaskQueue = {
    head: null,
    tail: null,
    listenerHead: null,
    listenerTail: null,

    enqueueDrawingTask: function (task) {
        const newNode = new Node(task);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
            console.log(`TaskQueue: Enqueued FIRST task: ${task.constructor.name}. Queue is now not empty.`);
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
            console.log(`TaskQueue: Enqueued subsequent task: ${task.constructor.name}.`);
        }
        console.log(`TaskQueue: Notifying listeners about enqueued task: ${task.constructor.name}.`);
        this.notifyListeners(task);
    },

    dequeue: function () {
        if (this.isEmpty()) {
            console.warn("TaskQueue: Attempted to dequeue from an empty queue. Returning null.");
            return null;
        }
        const value = this.head.value;
        this.head = this.head.next;
        if (this.isEmpty()) {
            this.tail = null;
            console.log(`TaskQueue: Dequeued last task: ${value.constructor.name}. Queue is now empty.`);
        } else {
            console.log(`TaskQueue: Dequeued task: ${value.constructor.name}. Remaining tasks in queue.`);
        }
        return value;
    },

    front: function () {
        if (this.isEmpty()) {
            // console.log("TaskQueue: Checked front of empty queue. Returning null."); // Can be chatty, keep commented unless needed
            return null;
        }
        // console.log(`TaskQueue: Checked front. Task is ${this.head.value.constructor.name}.`); // Can be chatty
        return this.head.value;
    },

    isEmpty: function () {
        return this.head === null;
    },

    addListener: function (listener) {
        const newListenerNode = new Node(listener);
        if (this.isListenerEmpty()) {
            this.listenerHead = newListenerNode;
            this.listenerTail = newListenerNode;
            console.log(`TaskQueue: Added FIRST listener: ${listener.constructor.name || listener.name}.`);
        } else {
            this.listenerTail.next = newListenerNode;
            this.listenerTail = newListenerNode;
            console.log(`TaskQueue: Added subsequent listener: ${listener.constructor.name || listener.name}.`);
        }
    },

    removeListener: function (listener) {
        if (this.isListenerEmpty()) {
            return;
        }
        if (this.listenerHead.value === listener) {
            this.listenerHead = this.listenerHead.next;
            if (this.isListenerEmpty()) {
                this.listenerTail = null;
            }
            return;
        }
        let current = this.listenerHead;
        while (current.next) {
            if (current.next.value === listener) {
                current.next = current.next.next;
                if (!current.next) {
                    this.listenerTail = current;
                }
                return;
            }
            current = current.next;
        }
    },

    notifyListeners: function (task) {
        let current = this.listenerHead;
        while (current) {
            // console.log(`TaskQueue: Notifying listener ${current.value.constructor.name || current.value.name} about enqueued task ${task.constructor.name}.`); // Can be chatty
            current.value.onTaskEnqueued(task);
            current = current.next;
        }
    },

    isListenerEmpty: function () {
        return this.listenerHead === null;
    }
};