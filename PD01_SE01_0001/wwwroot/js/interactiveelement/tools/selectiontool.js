/*
    wwwroot/js/interactiveelement/tools/selectiontool.js
    Version: 0.1.3 // Version increment for updated import paths and deselecting
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Selection Tool
    ==============
*/

import { GeometricConstruction, ConstructionState } from '../geometricconstruction/geometricconstruction.js'; // Corrected path
import { GeometricPlane } from '../geometricconstruction/geometricplane.js'; // Corrected path

class SelectionIdleState extends ConstructionState {
    constructor(selectionTool) {
        super();
        this.selectionTool = selectionTool;
        console.log('SelectionTool: Entered IdleState. Ready for selection/hover.');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;

        const hitImplement = this.selectionTool.geometricPlane.hitTest(mouseX, mouseY, this.interactionHitRadius);

        let hitConstruction = null;
        if (hitImplement && hitImplement._ownerConstruction) {
            hitConstruction = hitImplement._ownerConstruction;
        }

        if (hitConstruction) {
            console.log(`SelectionTool (Idle): Mouse Down - Hit on ${hitConstruction.constructor.name}. Delegating to select.`);

            // Deselect any previously selected object if it's different from the new hit
            if (this.selectionTool.geometricPlane.currentlySelectedObject && this.selectionTool.geometricPlane.currentlySelectedObject !== hitConstruction) {
                this.selectionTool.geometricPlane.currentlySelectedObject.deselect();
            }

            // Select the new hit object
            hitConstruction.select();
            this.selectionTool.geometricPlane.currentlySelectedObject = hitConstruction;

            // Transition to SelectionTool's active state if interaction starts (e.g., drag)
            this.selectionTool.currentState = this.selectionTool.selectionActiveState;
            console.log('SelectionTool (Idle): Transitioning to SelectionActiveState.');
            event.isHandled = true; // Mark as handled
        } else {
            // No object hit. Deselect any currently selected object.
            if (this.selectionTool.geometricPlane.currentlySelectedObject) {
                console.log('SelectionTool (Idle): Mouse Down - No hit. Deselecting current object.');
                this.selectionTool.geometricPlane.currentlySelectedObject.deselect();
                this.selectionTool.geometricPlane.currentlySelectedObject = null;
                event.isHandled = true; // Mark as handled
            } else {
                console.log('SelectionTool (Idle): Mouse Down - No hit and nothing selected. No action for selection tool.');
            }
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        // Hover logic is handled by GeometricPlane's idle state now, not SelectionTool directly
        // The GeometricPlane's acceptMouseMove will manage hover visuals for its children.
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        // No action
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        // Click action is handled by acceptMouseDown, which then transitions to selected state.
        // This click should be ignored if already handled by mousedown.
        if (event.isHandled) {
            return;
        }

        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        const clickHitImplement = this.selectionTool.geometricPlane.hitTest(mouseX, mouseY, hitRadius);
        let clickHitConstruction = null;
        if (clickHitImplement && clickHitImplement._ownerConstruction) {
            clickHitConstruction = clickHitImplement._ownerConstruction;
        }

        if (clickHitConstruction) {
            console.log(`SelectionTool (Idle): Mouse Click - Hit on ${clickHitConstruction.constructor.name}. Delegating to select.`);
            // Deselect any previously selected object if it's different from the new hit
            if (this.selectionTool.geometricPlane.currentlySelectedObject && this.selectionTool.geometricPlane.currentlySelectedObject !== clickHitConstruction) {
                this.selectionTool.geometricPlane.currentlySelectedObject.deselect();
            }
            clickHitConstruction.select();
            this.selectionTool.geometricPlane.currentlySelectedObject = clickHitConstruction;
            event.isHandled = true;
        } else {
            if (this.selectionTool.geometricPlane.currentlySelectedObject) {
                console.log('SelectionTool (Idle): Mouse Click - No child hit. Deselecting current object.');
                this.selectionTool.geometricPlane.currentlySelectedObject.deselect();
                this.selectionTool.geometricPlane.currentlySelectedObject = null;
                event.isHandled = true;
            }
        }
    }
}

class SelectionActiveState extends ConstructionState {
    constructor(selectionTool) {
        super();
        this.selectionTool = selectionTool;
        console.log('SelectionTool: Entered SelectionActiveState (Object selected/drag initiated).');
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        if (this.selectionTool.geometricPlane.currentlySelectedObject) {
            // Delegate mouse move to the currently selected object (e.g., for dragging)
            this.selectionTool.geometricPlane.currentlySelectedObject.acceptMouseMove(rootSvg, parentSvg, event);
            event.isHandled = true;
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.selectionTool.geometricPlane.currentlySelectedObject) {
            // Delegate mouse up to the currently selected object (e.g., to stop drag)
            this.selectionTool.geometricPlane.currentlySelectedObject.acceptMouseUp(rootSvg, parentSvg, event);
        }
        this.selectionTool.currentState = this.selectionTool.selectionIdleState; // Revert to idle after mouse up
        console.log('SelectionTool: Transitioning to SelectionIdleState (MouseUp detected).');
        event.isHandled = true;
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        // No action here, already active via previous mousedown
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        // This click event is a residual from the mousedown that initiated drag/selection.
        // It should be marked as handled to prevent further processing by GeometricPlane.
        event.isHandled = true;
        console.log('SelectionTool (Active): Mouse click - Event handled after state transition.');
    }
}

export class SelectionTool extends GeometricConstruction {
    geometricPlane = null;

    selectionIdleState;
    selectionActiveState;

    constructor(config = {}) {
        super(config);
        this.geometricPlane = config.geometricPlane;

        this.selectionIdleState = new SelectionIdleState(this);
        this.selectionActiveState = new SelectionActiveState(this);

        this.currentState = this.selectionIdleState; // Initial state
        this.taskManager = config.taskManager; // Ensure taskManager is passed
    }

    startDrawing() {
        // Selection tool doesn't "draw" in the same way, but activates its state machine.
        // It should become the first responder.
        if (this.taskManager) {
            this.taskManager.firstResponder = this;
            console.log('SelectionTool: Activated as firstResponder.');
        } else {
            console.error('SelectionTool: TaskManager not set. Cannot activate.');
        }
    }

    stop() {
        // When selection tool stops, ensure any selected object is deselected
        if (this.geometricPlane && this.geometricPlane.currentlySelectedObject) {
            this.geometricPlane.currentlySelectedObject.deselect();
            this.geometricPlane.currentlySelectedObject = null;
        }
        super.stop();
        console.log('SelectionTool: Deactivated.');
    }

    // Delegation of events will be done via TaskManager
}