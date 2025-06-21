/*
    wwwroot/js/interactiveelement/geometricconstruction/pointconstruction.js
    Version: 1.2.15 // Version increment for ConstructionState correction
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/
*/

import { GeometricConstruction } from './geometricconstruction.js'; // Corrected path
import { ConstructionState } from '../core/constructionstate.js';   // Corrected path
import { logger, LogLevel } from '../core/logger.js';
import { PointImplement } from '../implements/pointimplement.js';

// --- PointConstruction States ---

class WaitingForMouseEnterState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction; // Corrected: Use logger.debug
        logger.debug('PointState: Entered WaitingForMouseEnterState (Neutral).');
        this.geometricConstruction.updateVisual(); // On entry, ensure default visual state
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Neutral): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
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
                this.geometricConstruction.currentState = this.geometricConstruction.hoverState; // Corrected: Use logger.debug
                this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
                logger.debug('PointState (Neutral): Mouse over - Hit, transitioning to HoverState');
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
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Neutral): Mouse click - Hit, transitioning to SelectedState.');
        } else {
            // Not a hit, no action for this point. GeometricPlane will handle deselecting others.
        }
    }
}

// HoverState
class HoverState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction; // Corrected: Use logger.debug
        logger.debug('PointState: Entered HoverState.');
        this.geometricConstruction.updateVisual(); // Request visual update on entry (to grey)
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState; // Corrected: Use logger.debug
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Hover): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
        } else {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Corrected: Use logger.debug
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Hover): Mouse down - Not a hit, transitioning to NeutralState');
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (!this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.deselect(); // Corrected: Use logger.debug
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Corrected: Use logger.debug
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Hover): Mouse off - No hit, transitioning to NeutralState');
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
            this.geometricConstruction.currentState = this.geometricConstruction.selectedState; // Corrected: Use logger.debug
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Hover): Mouse click - Hit, transitioning to SelectedState.');
        } else {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Corrected: Use logger.debug
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Hover): Mouse click - Not a hit, transitioning to NeutralState');
        }
    }
}

// SelectedState
class SelectedState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction; // Corrected: Use logger.debug
        logger.debug('PointState: Entered SelectedState.');
        this.geometricConstruction.updateVisual(); // Request visual update on entry
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;
        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            this.geometricConstruction.updateVisual(); // Corrected: Use logger.debug
            logger.debug('PointState (Selected): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag)');
        } else {
            // Clicked outside the selected point. GeometricPlane will handle deselect.
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        this.geometricConstruction.updateVisual(); // Ensure visual is correct
        // logger.debug('PointState (Selected): Mouse move - Stays in SelectedState.');
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        // No action
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        // logger.debug('PointState (Selected): Mouse click - Stays in SelectedState.');
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
            this.geometricConstruction._implement.data.fill = 'black';
        }
        this.geometricConstruction.updateVisual();
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseDownOnAdditionState; // Corrected: Use logger.debug
        logger.debug('PointState (Enqueued): Mouse move - visual added and positioned, transitioned to WaitingForMouseDownOnAdditionState');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        this.geometricConstruction.x = event.clientX - rootSvg.getBoundingClientRect().left;
        this.geometricConstruction.y = event.clientY - rootSvg.getBoundingClientRect().top;
        if (!this.geometricConstruction.visualElement) {
            this.geometricConstruction.createVisual(rootSvg, parentSvg);
            this.geometricConstruction._implement.data.fill = 'black';
        }
        this.geometricConstruction.updateVisual();
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseDownOnAdditionState; // Corrected: Use logger.debug
        logger.debug('PointState (Enqueued): Mouse down - visual added and positioned, transitioned to WaitingForMouseDownOnAdditionState');
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
            this.geometricConstruction._implement.data.fill = 'black';
        }

        var x = event.clientX - rootSvg.getBoundingClientRect().left;
        var y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(x, y);
        this.hasMouseDown = true; // Corrected: Use logger.debug
        logger.debug('PointState (OnAddition WaitingForMouseDown): Mouse down - point placed. Waiting for MouseUp to finalize task.');
        event.isHandled = true;
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        // Only update position if mousedown has NOT occurred.
        // If mousedown has occurred, we are in a drag-like preview before mouseup.
        if (!this.hasMouseDown) {
            var x = event.clientX - rootSvg.getBoundingClientRect().left;
            var y = event.clientY - rootSvg.getBoundingClientRect().top;
            this.geometricConstruction.updatePosition(x, y);
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.hasMouseDown) {
            logger.debug('PointState (OnAddition WaitingForMouseDown): Mouse up - PointConstruction task finished, yielding control.');

            // Assign ID to implement's data BEFORE yielding. TaskManager uses this ID.
            if (!this.geometricConstruction._implement.id) {
                this.geometricConstruction._implement.id = `point-${Date.now()}`;
            }

            this.geometricConstruction.isAddedToPlane = true;
            this.geometricConstruction.yieldControl();

            // Corrected: Explicitly transition to NeutralState immediately after yielding
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Corrected: Update visual after state change
            this.geometricConstruction.updateVisual(); // Corrected: Update visual after state change
            event.isHandled = true;
        } else {
            // logger.debug('PointState (OnAddition WaitingForMouseDown): Mouse up - no mousedown detected in this state, no action.');
        }
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        event.isHandled = true;
    }
}


class WaitingForMouseUpOnDragState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction; // Corrected: Use logger.debug
        logger.debug('PointState: Entered WaitingForMouseUpOnDragState.');
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(mouseX, mouseY);
        this.geometricConstruction.currentState = this.geometricConstruction.selectedState; // Transition to Selected after drag
        this.geometricConstruction.updateVisual(); // Corrected: Update visual after state change
        logger.debug('PointState: Mouse up - transitioned to SelectedState, drag stopped');
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.updatePosition(mouseX, mouseY); // Corrected: Use logger.debug
        logger.debug('PointState: Mouse move - dragging point to', mouseX, mouseY);
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

    _implement = null;

    isAddedToPlane = false;

    constructor(config = {}) {
        super(config);

        this._implement = new PointImplement(null, {
            x: 0, y: 0,
            rootSvg: this.rootSvg,
            localGroup: this.localGroup
        });

        this._implement._ownerConstruction = this;

        this.enqueuedForDrawingState = new EnqueuedForDrawingState(this);
        this.waitingForMouseDownOnAdditionState = new WaitingForMouseDownOnAdditionState(this);
        this.waitingForMouseEnterState = new WaitingForMouseEnterState(this);
        this.hoverState = new HoverState(this);
        this.selectedState = new SelectedState(this);
        this.waitingForMouseUpOnDragState = new WaitingForMouseUpOnDragState(this);

        this.currentState = this.waitingForMouseEnterState;

        this.isAddedToPlane = false;
    }

    startDrawing() {
        this.currentState = this.enqueuedForDrawingState;
        if (this._implement.visualElement && this._implement.visualElement.parentNode) {
            this._implement.removeVisual();
        }
        this.isAddedToPlane = false;
        this._implement.id = null; // Reset _implement ID for a new drawing cycle
        logger.debug('PointConstruction: Started drawing, entered EnqueuedForDrawingState.');
    }

    createVisual(rootSvg, parentSvg) {
        this._implement.createVisual(rootSvg, parentSvg);
    }

    updateVisual() {
        if (this._implement) {
            this._implement.data.selected = this.selected;
            this._implement.data.currentState = this.currentState;
            this._implement.data.hoverState = this.hoverState;
            this._implement.updateVisual();
        }
    }

    hitTest(mouseX, mouseY, hitRadius = 8) {
        if (this._implement && typeof this._implement.hitTest === 'function') {
            if (this._implement.hitTest(mouseX, mouseY, hitRadius)) {
                return this;
            }
        }
        return null;
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