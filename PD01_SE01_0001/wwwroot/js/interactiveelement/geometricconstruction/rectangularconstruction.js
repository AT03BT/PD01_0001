/*
    wwwroot/js/interactiveelement/geometricconstruction/rectangularconstruction.js
    Version: 0.4.8 // Version increment for corrected import paths
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Rectangular Construction
    ========================
*/

import { GeometricConstruction } from './geometricconstruction.js'; // Corrected path
import { ConstructionState } from '../core/constructionstate.js';   // Corrected path
import { PointConstruction } from './pointconstruction.js';         // Corrected path (used for corner handles)
import { RectangleImplement } from '../implements/rectangleimplement.js'; // Corrected path
import { PointImplement } from '../implements/pointimplement.js';     // Corrected path

// --- RectangularConstruction States (Creation Flow) ---
class WaitingForPoint_A extends ConstructionState {
    constructor(geometricConstruction) { // Passed geometricConstruction directly
        super(); // Call super without config
        this.geometricConstruction = geometricConstruction;

        this.pointA = null;
        this.pointB = null;

        // Initialize RectangleImplement which holds x,y,width,height
        this._implement = new RectangleImplement(null, { // ID will be set by GeometricPlane.addChild
            x: 0, y: 0, width: 0, height: 0, // Initial default values
            rootSvg: this.geometricConstruction.rootSvg, // Use construction's rootSvg
            localGroup: this.geometricConstruction.localGroup // Use construction's localGroup
        });
        // Explicitly assign _ownerConstruction
        this._implement._ownerConstruction = this.geometricConstruction;

        // Initialize PointImplement for top-left handle visual feedback
        this.geometricConstruction.topLeft = new PointConstruction({
            rootSvg: this.geometricConstruction.rootSvg,
            localGroup: this.geometricConstruction.localGroup // Handles will be in the same group as the rectangle
        });
        // Ensure its implement has a non-null ID if it's to be added by TaskManager later
        this.geometricConstruction.topLeft._implement.id = `rect-handle-tl-${Date.now()}`;
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        const isValidTarget = event.target === rootSvg ||
            event.target === parentSvg ||
            (this.geometricConstruction.topLeft && event.target === this.geometricConstruction.topLeft.visualElement);

        if (!isValidTarget) {
            console.log('RectangularConstruction (WaitingForPoint_A): Mouseup target is not main canvas, plane, or construction visual. Ignoring for creation.');
            return;
        }

        const x = event.clientX - rootSvg.getBoundingClientRect().left;
        const y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.setPointA(x, y);
        // Only create the rectangle visual after the first point is set
        this.geometricConstruction.setConstructionVisual(rootSvg, parentSvg, x, y);
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForPointBState;
        console.log('RectangularConstruction: WaitingForPoint_A - Point A set');
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        // Optional: Could show a temporary visual feedback even before Point A is set
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        // This state primarily waits for MouseUp. Mousedown here is not directly used for placement.
    }
}

class WaitingForPoint_B extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const x = event.clientX - rootSvg.getBoundingClientRect().left;
        const y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.setPointB(x, y); // Update point B in real-time
        this.geometricConstruction.updateSizeAndPosition(); // Update rectangle visual based on points
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        const x = event.clientX - rootSvg.getBoundingClientRect().left;
        const y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.setPointB(x, y); // Finalize point B
        this.geometricConstruction.updateSizeAndPosition(); // Finalize rectangle visual

        // Generate ID for the rectangle itself before yielding
        if (!this.geometricConstruction._implement.id) {
            this.geometricConstruction._implement.id = `rectangle-${Date.now()}`;
        }

        this.geometricConstruction.yieldControl(); // Yield control to TaskManager
        this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState; // Transition to Neutral after creation
        event.isHandled = true; // Mark as handled
        console.log('RectangularConstruction: WaitingForPoint_B - Rectangle finalized.');
    }
}

// Selection states (similar to PointConstruction, but for rectangle)
class RectangularIdleState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('RectangularConstruction: Entered IdleState (Neutral).');
        this.geometricConstruction.updateVisual();
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8; // For handle hit testing

        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            // If the rectangle body is hit, select it and prepare for drag
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('RectangularConstruction (Idle): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag).');
        } else {
            // Not a hit. GeometricPlane will handle deselecting others if necessary.
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            if (!this.geometricConstruction.selected) {
                this.geometricConstruction.currentState = this.geometricConstruction.hoverState;
                console.log('RectangularConstruction (Idle): Mouse over - Hit, transitioning to HoverState.');
            }
        } else {
            // No hit, ensure it's not in hover state
            if (this.geometricConstruction.currentState === this.geometricConstruction.hoverState) {
                this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
                console.log('RectangularConstruction (Idle): Mouse off - No hit, transitioning to NeutralState.');
            }
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
}

class RectangularHoverState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('RectangularConstruction: Entered HoverState.');
        this.geometricConstruction.updateVisual(); // To grey
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.select();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('RectangularConstruction (Hover): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag).');
        } else {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
            console.log('RectangularConstruction (Hover): Mouse down - Not a hit, transitioning to NeutralState.');
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (!this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.deselect();
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseEnterState;
            console.log('RectangularConstruction (Hover): Mouse off - No hit, transitioning to NeutralState.');
        } else {
            this.geometricConstruction.updateVisual(); // Still hovered
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
}

class RectangularSelectedState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('RectangularConstruction: Entered SelectedState.');
        this.geometricConstruction.updateVisual(); // To blue
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        if (this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius)) {
            this.geometricConstruction.currentState = this.geometricConstruction.waitingForMouseUpOnDragState;
            console.log('RectangularConstruction (Selected): Mouse down - Hit, transitioning to WaitingForMouseUpOnDragState (for drag).');
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        this.geometricConstruction.updateVisual();
    }

    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
}

class WaitingForMouseUpOnDragState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        this.dragStartX = 0;
        this.dragStartY = 0;
        console.log('RectangularConstruction: Entered WaitingForMouseUpOnDragState.');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        // Store starting drag position for offset calculation
        this.dragStartX = event.clientX - rootSvg.getBoundingClientRect().left;
        this.dragStartY = event.clientY - rootSvg.getBoundingClientRect().top;
        console.log('RectangularConstruction: Drag started at', this.dragStartX, this.dragStartY);
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const currentX = event.clientX - rootSvg.getBoundingClientRect().left;
        const currentY = event.clientY - rootSvg.getBoundingClientRect().top;

        const deltaX = currentX - this.dragStartX;
        const deltaY = currentY - this.dragStartY;

        // Update rectangle's position relative to its original position before drag
        this.geometricConstruction.x += deltaX;
        this.geometricConstruction.y += deltaY;

        // Re-set drag start for continuous dragging based on new position
        this.dragStartX = currentX;
        this.dragStartY = currentY;

        this.geometricConstruction.updateVisual();
        console.log('RectangularConstruction: Dragging to', this.geometricConstruction.x, this.geometricConstruction.y);
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        console.log('RectangularConstruction: Mouse up - drag stopped.');
        this.geometricConstruction.currentState = this.geometricConstruction.selectedState; // Transition back to selected
    }
}

// --- RectangularConstruction Class ---
export class RectangularConstruction extends GeometricConstruction {
    pointA = { x: 0, y: 0 };
    pointB = { x: 0, y: 0 };
    topLeft = null; // PointConstruction for top-left handle
    topRight = null;
    bottomLeft = null;
    bottomRight = null;

    // States
    waitingForPointAState;
    waitingForPointBState;
    waitingForMouseEnterState;
    hoverState;
    selectedState;
    waitingForMouseUpOnDragState;

    _implement = null; // RectangleImplement instance

    isAddedToPlane = false;

    constructor(config = {}) {
        super(config);

        this.waitingForPointAState = new WaitingForPoint_A(this);
        this.waitingForPointBState = new WaitingForPoint_B(this);
        this.waitingForMouseEnterState = new RectangularIdleState(this);
        this.hoverState = new RectangularHoverState(this);
        this.selectedState = new RectangularSelectedState(this);
        this.waitingForMouseUpOnDragState = new WaitingForMouseUpOnDragState(this);

        this.currentState = this.waitingForMouseEnterState; // Default to neutral

        // Handles for resizing
        this.topLeft = new PointConstruction({
            rootSvg: this.rootSvg,
            localGroup: this.localGroup,
            r: 5, // Larger radius for handles
            fill: 'red',
            stroke: 'red',
            strokeWidth: 1
        });
        this.topRight = new PointConstruction({
            rootSvg: this.rootSvg,
            localGroup: this.localGroup,
            r: 5, fill: 'red', stroke: 'red', strokeWidth: 1
        });
        this.bottomLeft = new PointConstruction({
            rootSvg: this.rootSvg,
            localGroup: this.localGroup,
            r: 5, fill: 'red', stroke: 'red', strokeWidth: 1
        });
        this.bottomRight = new PointConstruction({
            rootSvg: this.rootSvg,
            localGroup: this.localGroup,
            r: 5, fill: 'red', stroke: 'red', strokeWidth: 1
        });

        // Explicitly set ownerConstruction for handles
        this.topLeft._implement._ownerConstruction = this;
        this.topRight._implement._ownerConstruction = this;
        this.bottomLeft._implement._ownerConstruction = this;
        this.bottomRight._implement._ownerConstruction = this;

        // Initialize RectangleImplement itself
        this._implement = new RectangleImplement(null, { // ID will be set by GeometricPlane.addChild
            x: 0, y: 0, width: 0, height: 0,
            rootSvg: this.rootSvg,
            localGroup: this.localGroup
        });
        this._implement._ownerConstruction = this; // Explicitly set ownerConstruction

        this.isAddedToPlane = false;
    }

    startDrawing() {
        this.currentState = this.waitingForPointAState;
        this.isAddedToPlane = false;
        // Remove rectangle visual if it was previously drawn
        if (this._implement.visualElement && this._implement.visualElement.parentNode) {
            this._implement.removeVisual();
        }
        // Hide handles during initial drawing
        this.hideHandles();
        console.log('RectangularConstruction: Started drawing, waiting for Point A.');
    }

    setPointA(x, y) {
        this.pointA = { x, y };
        // Place initial handle
        this.topLeft.updatePosition(x, y);
        this.topLeft.createVisual(this.rootSvg, this.localGroup); // Ensure handle visual is created
        this.topLeft.updateVisual(); // Update its visual
        console.log('RectangularConstruction: Point A set at', x, y);
    }

    setPointB(x, y) {
        this.pointB = { x, y };
        console.log('RectangularConstruction: Point B updated to', x, y);
    }

    updateSizeAndPosition() {
        const x = Math.min(this.pointA.x, this.pointB.x);
        const y = Math.min(this.pointA.y, this.pointB.y);
        const width = Math.abs(this.pointA.x - this.pointB.x);
        const height = Math.abs(this.pointA.y - this.pointB.y);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Update handle positions
        this.topLeft.updatePosition(x, y, true);
        this.topRight.updatePosition(x + width, y, true);
        this.bottomLeft.updatePosition(x, y + height, true);
        this.bottomRight.updatePosition(x + width, y + height, true);

        // Ensure rectangle visual is created and updated
        if (!this._implement.visualElement) {
            this.createVisual(this.rootSvg, this.localGroup);
        }
        this.updateVisual();
    }

    // `createVisual` for the rectangle itself
    createVisual(rootSvg, parentSvg) {
        this._implement.createVisual(rootSvg, parentSvg);
    }

    // `updateVisual` for the rectangle itself (delegates to implement)
    updateVisual() {
        if (this._implement) {
            this._implement.data.selected = this.selected; // Pass selection state
            this._implement.data.currentState = this.currentState; // Pass current state
            this._implement.data.hoverState = this.hoverState;     // Pass hover state
            this._implement.updateVisual();
        }

        // Update handle visuals
        this.topLeft.updateVisual();
        this.topRight.updateVisual();
        this.bottomLeft.updateVisual();
        this.bottomRight.updateVisual();
    }

    hitTest(mouseX, mouseY, hitRadius = 8) {
        // Prioritize handle hit test
        let hitHandle = this.topLeft.hitTest(mouseX, mouseY, hitRadius) ||
            this.topRight.hitTest(mouseX, mouseY, hitRadius) ||
            this.bottomLeft.hitTest(mouseX, mouseY, hitRadius) ||
            this.bottomRight.hitTest(mouseX, mouseY, hitRadius);

        if (hitHandle) {
            return hitHandle._ownerConstruction; // Return the PointConstruction of the handle
        }

        // Then check rectangle body hit test
        if (this._implement && typeof this._implement.hitTest === 'function') {
            if (this._implement.hitTest(mouseX, mouseY, hitRadius)) {
                return this; // Return this RectangularConstruction instance
            }
        }
        return null;
    }

    showHandles() {
        this.topLeft.createVisual(this.rootSvg, this.localGroup);
        this.topRight.createVisual(this.rootSvg, this.localGroup);
        this.bottomLeft.createVisual(this.rootSvg, this.localGroup);
        this.bottomRight.createVisual(this.rootSvg, this.localGroup);

        this.topLeft.updateVisual();
        this.topRight.updateVisual();
        this.bottomLeft.updateVisual();
        this.bottomRight.updateVisual();
        console.log('RectangularConstruction: Handles shown.');
    }

    hideHandles() {
        this.topLeft.removeVisual();
        this.topRight.removeVisual();
        this.bottomLeft.removeVisual();
        this.bottomRight.removeVisual();
        console.log('RectangularConstruction: Handles hidden.');
    }

    isFinished() {
        return this.currentState === this.waitingForMouseEnterState || this.currentState === this.selectedState || this.currentState === this.hoverState;
    }
}