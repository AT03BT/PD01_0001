/*
    wwwroot/js/interactiveelement/geometricconstruction/geometricconstruction.js
    Version: 0.3.5 // Version increment for ensuring deselection transitions to neutral state
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Geometric Construction
    ======================
    Base class for interactive geometric entities (controllers/state machines).
    It now contains a DrawingImplement for its data and visual representation.
*/

import { ConstructionState } from '../core/constructionstate.js'; // Corrected path
import { DrawingImplement } from '../core/drawingimplement.js';     // Corrected path


export class GeometricConstruction {

    started = false;
    currentState = null;
    observers = [];

    rootSvg = null;
    localGroup = null;

    taskManager = null;

    selected = false;

    _implement = null; // Holds the DrawingImplement instance (model/view part)

    constructor(config = {}) {
        this.rootSvg = config.rootSvg || null;
        this.localGroup = config.localGroup || null;
        this.selected = false;
    }

    startDrawing() {
        console.error(`GeometricConstruction: startDrawing must be overridden by subclass ${this.constructor.name}.`);
    }

    stop() {
        this.currentState = null;
        this.deselect(); // Calls deselect to clean up visual state
        if (this._implement) {
            this._implement.removeVisual();
        }
    }

    select() {
        if (!this.selected) {
            this.selected = true;
            console.log(`${this.constructor.name} selected.`);
            if (this._implement) {
                this._implement.data.stroke = 'blue';
                this._implement.data.strokeWidth = 2;
                this._implement.updateVisual(); // Force visual update to selected colors
            }
            // Add any selection handles or visual cues here
            if (typeof this.showHandles === 'function') {
                this.showHandles();
            }
        }
    }

    deselect() {
        if (this.selected) {
            this.selected = false;
            console.log(`${this.constructor.name} deselected.`);
            if (this._implement) {
                this._implement.data.stroke = 'black';
                this._implement.data.strokeWidth = 1;
                this._implement.data.selected = false; // Sync implement's data.selected
                // No immediate updateVisual here; the state transition to NeutralState will call it.
            }
            // Remove any selection handles or visual cues here
            if (typeof this.hideHandles === 'function') {
                this.hideHandles();
            }

            // Explicitly transition to NeutralState upon deselection
            // This ensures the visual updates correctly based on the neutral state.
            // This relies on the specific GeometricConstruction (e.g., PointConstruction)
            // having its 'waitingForMouseEnterState' property available.
            if (this.waitingForMouseEnterState) {
                this.currentState = this.waitingForMouseEnterState;
                this.updateVisual(); // Force visual update to neutral colors
            } else {
                // Fallback: if no specific neutral state is defined, just update visual
                this.updateVisual();
            }
        }
    }

    addObserver(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(construction, changeDescription) {
        this.observers.forEach(observer => {
            if (observer && typeof observer.onConstructionChanged === 'function') {
                observer.onConstructionChanged(construction, changeDescription);
            } else {
                console.warn("Observer does not have 'onConstructionChanged' method or is null:", observer);
            }
        });
    }

    // Generic event handlers to delegate to current state
    acceptMouseDown(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseDown(rootSvg, parentSvg, event);
    }
    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseUp(rootSvg, parentSvg, event);
    }
    acceptMouseMove(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseMove(rootSvg, parentSvg, event);
    }
    acceptMouseClick(rootSvg, parentSvg, event) {
        if (this.currentState) {
            if (typeof this.currentState.acceptMouseClick === 'function') {
                this.currentState.acceptMouseClick(rootSvg, parentSvg, event);
            }
        }
    }
    acceptKeyDown(rootSvg, parentSvg, event) {
        if (this.currentState && typeof this.currentState.acceptKeyDown === 'function') {
            this.currentState.acceptKeyDown(rootSvg, parentSvg, event);
        }
    }
    acceptKeyUp(rootSvg, parentSvg, event) {
        if (this.currentState && typeof this.currentState.acceptKeyUp === 'function') {
            this.currentState.acceptKeyUp(rootSvg, parentSvg, event);
        }
    }
    acceptKeyPress(rootSvg, parentSvg, event) {
        if (this.currentState && typeof this.currentState.acceptKeyPress === 'function') {
            this.currentState.acceptKeyPress(rootSvg, parentSvg, event);
        }
    }

    // Getters/Setters for properties on _implement
    get visualElement() {
        return this._implement ? this._implement.visualElement : null;
    }
    get x() { return this._implement ? this._implement.data.x : 0; }
    set x(value) { if (this._implement) this._implement.data.x = value; }
    get y() { return this._implement ? this._implement.data.y : 0; }
    set y(value) { if (this._implement) this._implement.data.y = value; }
    get width() { return this._implement ? this._implement.data.width : 0; }
    set width(value) { if (this._implement) this._implement.data.width = value; }
    get height() { return this._implement ? this._implement.data.height : 0; }
    set height(value) { if (this._implement) this._implement.data.height = value; }

    updatePosition(x, y, isInternal = false) {
        if (this._implement) {
            this._implement.data.x = x;
            this._implement.data.y = y;
            this._implement.updateVisual();
        }
        if (!isInternal) {
            this.notifyObservers(this, 'moved');
        }
    }

    hitTest(mouseX, mouseY, hitRadius) {
        if (this._implement && typeof this._implement.hitTest === 'function') {
            if (this._implement.hitTest(mouseX, mouseY, hitRadius)) {
                return this;
            }
        }
        return null;
    }

    updateVisual() {
        if (this._implement && typeof this._implement.updateVisual === 'function') {
            this._implement.updateVisual();
        }
    }

    isFinished() {
        return false;
    }

    yieldControl() {
        if (this.taskManager && typeof this.taskManager.yieldCurrentTask === 'function') {
            this.taskManager.yieldCurrentTask(this); // Pass 'this' as the task that is yielding
        } else {
            console.error("GeometricConstruction: Cannot yield control, taskManager or yieldCurrentTask is not set.");
        }
    }
}
// REMOVED from here: export class ConstructionState { ... }