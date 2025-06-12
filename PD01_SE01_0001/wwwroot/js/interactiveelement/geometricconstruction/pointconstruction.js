/*
    wwwroot/js/interactiveelement/page8/geometricconstruction/pointconstruction.js
    Version: 1.2.8 // Version increment for removing isAddedToPlane and consolidating ID
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/
*/

import { GeometricConstruction } from './geometricconstruction.js';
import { ConstructionState } from '../core/constructionstate.js';
import { PointImplement } from '../implements/pointimplement.js';

// --- PointConstruction States ---

class WaitingForMouseEnterState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('PointState: Entered WaitingForMouseEnterState (Neutral).');
        this.geometricConstruction.updateVisual(); // On entry, ensure default visual state
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('PointState (Neutral): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
        } else {
            // Not a hit, no action for this point. GeometricPlane will handle deselecting others.
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            if (!this.geometricConstruction.selected) {
                this.geometricConstruction.currentState = this.geometricConstruction.hoverState;
                console.log('PointState (Neutral): Mouse over - Hit, transitioning to HoverState');
            }
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        // No action
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.selectedState;
            console.log('PointState (Neutral): Mouse click - Hit, transitioning to SelectedState.');
        } else {
            // Not a hit, no action for this point. GeometricPlane will handle deselecting others.
        }
    }
}

// HoverState
class HoverState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('PointState: Entered HoverState.');
        this.geometricConstruction.updateVisual(); // Request visual update on entry (to grey)
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('PointState (Hover): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
        } else {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
            console.log('PointState (Hover): Mouse down - Not a hit, transitioning to NeutralState');
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (!this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
            console.log('PointState (Hover): Mouse off - No hit, transitioning to NeutralState');
        } else {
            this.geometricConstruction.updateVisual(); // Still hovering, ensure visual is correct
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        // No action
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.selectedState;
            console.log('PointState (Hover): Mouse click - Hit, transitioning to SelectedState.');
        } else {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
            console.log('PointState (Hover): Mouse click - Not a hit, transitioning to NeutralState');
        }
    }
}

// SelectedState
class SelectedState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('PointState: Entered SelectedState.');
        this.geometricConstruction.updateVisual(); // Request visual update on entry
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('PointState (Selected): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
        } else {
            // Clicked outside the selected point. GeometricPlane will handle deselect.
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        this.geometricConstruction.updateVisual(); // Ensure visual is correct
        // console.log('PointState (Selected): Mouse move - Stays in SelectedState.');
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        // No action
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        // console.log('PointState (Selected): Mouse click - Stays in SelectedState.');
    }
}


// State for initial placement (only for direct point creation, not for points as part of a rectangle)
class EnqueuedForDrawingState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        this.geometricConstruction.x = event.clientX - rootSvg.getBoundingClientRect().left;
        this.geometricConstruction.y = event.clientY - rootSvg.getBoundingClientRect().top;
        if (!this.geometricConstruction.visualElement) {
            this.geometricConstruction.createVisual(rootSvg, parentSvg);
        }
        this.geometricConstruction.updateVisual();
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseDownOnAdditionState;
        console.log('PointState (Enqueued): Mouse move - visual added and positioned, transitioned to WaitingForMouseDownOnAdditionState');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        this.geometricConstruction.x = event.clientX - rootSvg.getBoundingClientRect().left;
        this.geometricConstruction.y = event.clientY - rootSvg.getBoundingClientRect().top;
        if (!this.geometricConstruction.visualElement) {
            this.geometricConstruction.createVisual(rootSvg, parentSvg);
        }
        this.geometricConstruction.updateVisual();
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseDownOnAdditionState;
        console.log('PointState (Enqueued): Mouse down - visual added and positioned, transitioned to WaitingForMouseDownOnAdditionState');
        this.geometricConstruction.currentState.acceptMouseDown(rootSvg, parentSvg, event);
    }
}


class WaitingForMouseDownOnAdditionState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        this.hasMouseDown = false; // Flag to track if mousedown occurred in this state
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        if (!this.geometricConstruction.visualElement) {
            this.geometricConstruction.createVisual(rootSvg, parentSvg);
        }

        var x = event.clientX - rootSvg.getBoundingClientRect().left;
        var y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(x, y); // Finalize position on click
        this.hasMouseDown = true; // Mark that mousedown has occurred
        console.log('PointState (OnAddition WaitingForMouseDown): Mouse down - point placed. Waiting for MouseUp to finalize task.');
        event.isHandled = true; // Mark as handled because this is the primary click for placement
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        // Only update position if mousedown has NOT occurred.
        // If mousedown has occurred, we are in a drag-like preview before mouseup.
        if (!this.hasMouseDown) {
            var x = event.clientX - rootSvg.getBoundingClientRect().left;
            var y = event.clientY - rootSvg.getBoundingClientRect().top;
            this.geometricConstruction.updatePosition(x, y); // Live update position before click
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.hasMouseDown) { // Only yield if a mousedown actually happened in this state
            console.log('PointState (OnAddition WaitingForMouseDown): Mouse up - PointConstruction task finished, yielding control.');

            // TaskManager.yieldCurrentTask will call rootGeometricPlane.addChild with the _implement.
            // ID is auto-generated by TaskManager now.

            this.geometricConstruction.yieldControl(); // Yield control to TaskManager
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Transition to Neutral after yielding
            event.isHandled = true; // Mark event as handled to stop click propagation
        } else {
            // console.log('PointState (OnAddition WaitingForMouseDown): Mouse up - no mousedown detected in this state, no action.');
        }
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        // ...
    }
}


class WaitingForMouseUpOnDragState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('PointState: Entered WaitingForMouseUpOnDragState.');
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(mouseX, mouseY);
        this.geometricConstruction.currentState = this.geometricConstruction.selectedState; // Transition to Selected after drag
        console.log('PointState: Mouse up - transitioned to SelectedState, drag stopped');
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(mouseX, mouseY);
        console.log('PointState: Mouse move - dragging point to', mouseX, mouseY);
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        // console.log('PointState (WaitingForMouseUpOnDragState): Mouse down - already dragging, no action');
    }
}

// --- PointConstruction Class ---
export class PointConstruction extends GeometricConstruction {

    enqueuedForDrawingState;
    waitingForMouseDownOnAdditionState;
    waitingForMouseEnterState;
    hoverState;
    selectedState;
    waitingForMouseUpOnDragState;

    _implement = null; // Holds the PointImplement instance

    isAddedToPlane = false; // Flag to track if this instance's implement has been added to the GeometricPlane

    constructor(config = {}) {
        super(config);

        // Create the PointImplement instance that holds the data and visual
        // MODIFIED: PointImplement no longer receives ownerConstruction as a parameter in its constructor
        this._implement = new PointImplement(null, { // ID, config
            x: 0, y: 0, // Initial default coordinates
            rootSvg: this.rootSvg,
            localGroup: this.localGroup
        });

        // NEW: Explicitly assign _ownerConstruction to the implement here, after PointImplement is instantiated.
        // This 'this' is the fully formed PointConstruction instance.
        this._implement._ownerConstruction = this;

        this.enqueuedForDrawingState = new EnqueuedForDrawingState(this);
        this.waitingForMouseDownOnAdditionState = new WaitingForMouseDownOnAdditionState(this);
        this.waitingForMouseEnterState = new WaitingForMouseEnterState(this);
        this.hoverState = new HoverState(this);
        this.selectedState = new SelectedState(this);
        this.waitingForMouseUpOnDragState = new WaitingForMouseUpOnDragState(this);

        this.currentState = this.waitingForMouseEnterState; // Default to neutral after creation

        this.isAddedToPlane = false;
    }

    startDrawing() {
        this.currentState = this.enqueuedForDrawingState;
        if (this._implement.visualElement && this._implement.visualElement.parentNode) {
            this._implement.removeVisual();
        }
        this.isAddedToPlane = false; // Reset for new drawing cycle
        console.log('PointConstruction: Started drawing, entered EnqueuedForDrawingState.');
    }

    // `createVisual` method now delegates to _implement
    createVisual(rootSvg, parentSvg) {
        this._implement.createVisual(rootSvg, parentSvg);
    }

    // `updateVisual` method now delegates to _implement
    updateVisual() {
        if (this._implement) {
            // Pass selection state to implement for visual styling
            this._implement.data.selected = this.selected; // Inform implement of selection state
            this._implement.data.currentState = this.currentState; // Inform implement of current state for fill logic
            this._implement.data.hoverState = this.hoverState; // Pass reference to hover state for comparison
            this._implement.updateVisual();
        }
    }

    // `updatePosition` method now delegates to _implement (via getter/setter from GeometricConstruction)
    // No change needed here, as x, y setters/getters in base class handle it.
    // The notifyObservers is already in base class's updatePosition.

    // `hitTest` method now delegates to _implement
    hitTest(mouseX, mouseY, hitRadius = 8) {
        if (this._implement && typeof this._implement.hitTest === 'function') {
            if (this._implement.hitTest(mouseX, mouseY, hitRadius)) {
                return this; // Return this GeometricConstruction instance on hit
            }
        }
        return null; // Return null on no hit
    }

    acceptMouseDown(rootSvg, parentSvg, event) { if (this.currentState) this.currentState.acceptMouseDown(rootSvg, parentSvg, event); }
    acceptMouseUp(rootSvg, parentSvg, event) { if (this.currentState) this.currentState.acceptMouseUp(rootSvg, parentSvg, event); }
    acceptMouseMove(rootSvg, parentSvg, event) { if (this.currentState) this.currentState.acceptMouseMove(rootSvg, parentSvg, event); }
    acceptMouseClick(rootSvg, parentSvg, event) { if (this.currentState) this.currentState.acceptMouseClick(rootSvg, parentSvg, event); }
    acceptKeyDown(rootSvg, parentSvg, event) { if (this.currentState && typeof this.currentState.acceptKeyDown === 'function') { this.currentState.acceptKeyDown(rootSvg, parentSvg, event); } }
    acceptKeyUp(rootSvg, parentSvg, event) { if (this.currentState && typeof this.currentState.acceptKeyUp === 'function') { this.currentState.acceptKeyUp(rootSvg, parentSvg, event); } }
    acceptKeyPress(rootSvg, parentSvg, event) { if (this.currentState && typeof this.currentState.acceptKeyPress === 'function') { this.currentState.acceptKeyPress(rootSvg, parentSvg, event); } }

    stop(rootSvg) {
        if (this._implement.visualElement && this._implement.visualElement.parentNode) {
            this._implement.removeVisual();
        }
        super.stop();
    }
}