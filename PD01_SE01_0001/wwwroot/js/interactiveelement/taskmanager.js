/*
    wwwroot/js/interactiveelement/page8/taskmanager.js
    Version: 0.3.13 // Version increment for using implement.id
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Task Manager
    ============
*/
import { TaskQueue } from './taskqueue.js';
import { GeometricPlane } from './geometricconstruction/geometricplane.js';

export const TaskManager = {

    currentTask: null,
    rootSvg: null,
    rootGeometricPlane: null,
    firstResponder: null,

    init: function (config) {
        this.rootSvg = config.rootSvg;
        this.rootGeometricPlane = config.rootGeometricPlane;
        this.firstResponder = config.firstResponder;

        if (this.rootGeometricPlane) {
            this.rootGeometricPlane.taskManager = this;
        }
        if (this.firstResponder) {
            this.firstResponder.taskManager = this;
        }

        this.configureEventDelegation();
        TaskQueue.addListener(this);

        console.log("TaskManager: Initializing with rootGeometricPlane as firstResponder.");
    },

    configureEventDelegation: function () {
        if (!this.rootSvg) {
            console.error("Drawing plane is not initialized. Event delegation cannot be configured.");
            return;
        }

        const events = ['mousedown', 'mouseup', 'mousemove', 'click', 'keydown', 'keyup', 'keypress', 'contextmenu'];
        events.forEach(eventType => {
            this.rootSvg.addEventListener(eventType, this.captureAndDispatchEvent.bind(this), true);
        });
    },

    captureAndDispatchEvent: function (event) {
        event.isHandled = false;
        this.dispatchInputEvent(event);
        if (event.isHandled) {
            event.stopPropagation();
        }
    },

    dispatchInputEvent: function (event) {
        try {
            if (event.type !== 'mousemove') {
                console.log('Event type:', event.type);
                console.log('Target element:', event.target);
                if (event instanceof MouseEvent) {
                    console.log('Mouse coordinates:', event.clientX, event.clientY);
                } else if (event instanceof KeyboardEvent) {
                    console.log('Key:', event.key);
                }
            }

            if (this.currentTask) {
                event.preventDefault();

                let eventHandler;
                switch (event.type) {
                    case 'mousedown': eventHandler = this.currentTask.acceptMouseDown; break;
                    case 'mouseup': eventHandler = this.currentTask.acceptMouseUp; break;
                    case 'mousemove': eventHandler = this.currentTask.acceptMouseMove; break;
                    case 'click': eventHandler = this.currentTask.acceptMouseClick; break;
                    case 'keydown': eventHandler = this.currentTask.acceptKeyDown; break;
                    case 'keyup': eventHandler = this.currentTask.acceptKeyUp; break;
                    case 'keypress': eventHandler = this.currentTask.acceptKeyPress; break;
                    default:
                        console.warn("Unknown event type: " + event.type + ". Event not dispatched to current task.");
                        return;
                }

                if (typeof eventHandler === 'function') {
                    eventHandler.call(this.currentTask, this.rootSvg, this.rootGeometricPlane.visualElement, event);
                } else {
                    console.warn(`Event handler for ${event.type} is not a function on the current task.`);
                }
            }
            else if (this.rootGeometricPlane) {
                let eventHandler;
                switch (event.type) {
                    case 'mousedown': eventHandler = this.rootGeometricPlane.acceptMouseDown; break;
                    case 'mouseup': eventHandler = this.rootGeometricPlane.acceptMouseUp; break;
                    case 'mousemove': eventHandler = this.rootGeometricPlane.acceptMouseMove; break;
                    case 'click': eventHandler = this.rootGeometricPlane.acceptMouseClick; break;
                    case 'keydown': eventHandler = this.rootGeometricPlane.acceptKeyDown; break;
                    case 'keyup': eventHandler = this.rootGeometricPlane.acceptKeyUp; break;
                    case 'keypress': eventHandler = this.rootGeometricPlane.acceptKeyPress; break;
                    default:
                        console.warn("Unknown event type: " + event.type + ". Event not dispatched to root GeometricPlane.");
                        return;
                }

                if (typeof eventHandler === 'function') {
                    eventHandler.call(this.rootGeometricPlane, this.rootSvg, this.rootGeometricPlane.visualElement, event);
                } else {
                    console.warn(`Event handler for ${event.type} is not a function on the root GeometricPlane.`);
                }
            }
        } catch (error) {
            console.error("Error dispatching event:", error, event);
        }
    },

    yieldCurrentTask: function () {
        if (this.currentTask) {
            console.log(`TaskManager: Current task (${this.currentTask.constructor.name}) yielded control.`);

            // NEW: Add the _implement of the yielded GeometricConstruction to the GeometricPlane.
            // Use the ID generated by the Construction itself and its _implement.
            if (this.currentTask._implement && this.currentTask._implement.id) {
                this.rootGeometricPlane.addChild(this.currentTask._implement.id, this.currentTask._implement);
            } else {
                console.error(`TaskManager: Yielded task (${this.currentTask.constructor.name}) has no _implement or no ID to add to GeometricPlane.`);
            }

            this.currentTask = null;
            this.startNextTask();
        }
    },

    onTaskEnqueued: function (task) {
        task.taskManager = this;
        if (!this.currentTask) {
            this.startNextTask();
        }
    },

    startNextTask: function () {
        console.log("TaskManager: Attempting to start next task. Queue front:", TaskQueue.front() ? TaskQueue.front().constructor.name : "empty");
        if (TaskQueue.front()) {
            this.currentTask = TaskQueue.dequeue();
            this.currentTask.taskManager = this;
            console.log(`TaskManager: New currentTask is ${this.currentTask.constructor.name}.`);
            if (this.currentTask && typeof this.currentTask.startDrawing === 'function') {
                this.currentTask.startDrawing();
            }
        } else {
            console.log("TaskManager: Task queue empty, reverting to rootGeometricPlane.");
            this.currentTask = null;
        }
    }
};