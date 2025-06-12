/*
    wwwroot/js/interactiveelement/page8/geometricconstruction/geometricconstruction.js
    Version: 0.3.4 // Version increment for explicit _implement.data sync
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Geometric Construction
    ======================
*/

import { ConstructionState } from '../core/constructionstate.js';
import { DrawingImplement } from '../core/drawingimplement.js';

export class GeometricConstruction {

    started = false;
    currentState = null;
    observers = [];

    rootSvg = null;
    localGroup = null;

    taskManager = null;

    selected = false;

    _implement = null;

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
        this.deselect();
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
                this._implement.data.selected = true; // Sync implement's data.selected
                this._implement.updateVisual();
            }
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
                this._implement.updateVisual(); // Will now revert to default
            }
            if (typeof this.hideHandles === 'function') {
                this.hideHandles();
            }
            // NEW: Ensure current state also reverts to neutral (if not already there)
            // This is important if an object was selected, and then deselected by clicking empty space.
            // It needs to be in a state that allows hover again.
            if (this.currentState && this.currentState !== this.waitingForMouseEnterState) { // Check if not already neutral
                // This requires knowledge of specific states. Let's make this more generic.
                // A deselect action usually puts the object back into its 'base' or 'idle' interactive state.
                // For now, we'll assume waitingForMouseEnterState is the default idle.
                if (this.waitingForMouseEnterState) { // Check if this state exists (for PointConstruction)
                    this.currentState = this.waitingForMouseEnterState;
                    this.updateVisual(); // Ensure visual updates after state change
                }
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
            this.taskManager.yieldCurrentTask();
        } else {
            console.error("GeometricConstruction: Cannot yield control, taskManager or yieldCurrentTask is not set.");
        }
    }
}

export class ConstructionState {
    geometricConstruction = null;
    acceptMouseDown(rootSvg, parentSvg, event) { }
    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseMove(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
    acceptKeyDown(rootSvg, parentSvg, event) { }
    acceptKeyUp(rootSvg, parentSvg, event) { }
    acceptKeyPress(rootSvg, parentSvg, event) { }
}