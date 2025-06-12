/*
    wwwroot/js/interactiveelement/geometricconstruction/rectangularconstruction.js
    Version: 0.4.7 // Version increment for robust _ownerConstruction assignment
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/
*/

import { GeometricConstruction } from './geometricconstruction.js';
import { ConstructionState } from '../core/constructionstate.js'; // MODIFIED PATH
import { PointConstruction } from './pointconstruction.js';
import { RectangleImplement } from '../implements/rectangleimplement.js'; // Correct path
import { PointImplement } from '../implements/pointimplement.js'; // Correct path

// --- RectangularConstruction States (Creation Flow) ---
class WaitingForPoint_A extends ConstructionState {
    constructor(config = {}) {
        super(config);

        this.pointA = null;
        this.pointB = null;
        this.addSelfToPlane = config.addSelfToPlane;

        // Initialize RectangleImplement which holds x,y,width,height
        // MODIFIED: Pass 'ownerConstruction: this' to the RectangleImplement constructor
        this._implement = new RectangleImplement(null, { // ID will be set by GeometricPlane.addChild
            x: 0, y: 0, width: 0, height: 0, // Initial default values
            rootSvg: this.rootSvg,
            localGroup: this.localGroup,
            ownerConstruction: this // NEW: Pass reference to this RectangularConstruction instance
        });

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

        if (this.geometricConstruction.bottomRight && !this.geometricConstruction.bottomRight.visualElement) {
            this.geometricConstruction.bottomRight.createVisual(rootSvg, parentSvg);
        }
        if (this.geometricConstruction.bottomRight) {
            this.geometricConstruction.bottomRight.updatePosition(x, y, true);
        }

        this.geometricConstruction.updateConstructionVisual(x, y);
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        const isValidTarget = event.target === rootSvg ||
            event.target === parentSvg ||
            (this.geometricConstruction.visualElement && event.target === this.geometricConstruction.visualElement) ||
            (this.geometricConstruction.bottomRight && event.target === this.geometricConstruction.bottomRight.visualElement);

        if (!isValidTarget) {
            console.log('RectangularConstruction (WaitingForPoint_B): Mouseup target is not a valid creation visual. Ignoring for creation.');
            return;
        }

        const x = event.clientX - rootSvg.getBoundingClientRect().left;
        const y = event.clientY - rootSvg.getBoundingClientRect().top;
        this.geometricConstruction.setPointB(x, y);
        this.geometricConstruction.finalise(rootSvg, parentSvg);
        console.log('RectangularConstruction: WaitingForPoint_B - Point B set, rectangle finalised, yielding control.');

        // REMOVED: All calls to this.geometricConstruction.addSelfToPlane(...)
        // and the isAddedToPlane flag logic.
        // This is now handled by TaskManager.yieldCurrentTask().

        this.geometricConstruction.yieldControl();
        this.geometricConstruction.currentState = this.geometricConstruction.idleState;
        event.isHandled = true;
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        // ...
    }
}


// IdleState for RectangularConstruction
class IdleState extends ConstructionState {
    constructor(geometricConstruction) {
        super();
        this.geometricConstruction = geometricConstruction;
        console.log('RectangularConstruction: Entered IdleState. Ready for selection/manipulation.');
        // Ensure rectangle visual is black (default) and handles are hidden on entry
        this.geometricConstruction.deselect(); // This also updates visual for RC
        this.geometricConstruction.hideHandles(); // CORRECTED: Call on this.geometricConstruction directly
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitResult = this.geometricConstruction.hitTest(mouseX, mouseY);

        if (hitResult instanceof PointConstruction) {
            console.log('RectangularConstruction (Idle): Hit on corner point, delegating to point.');
            if (!this.geometricConstruction.selected) {
                this.geometricConstruction.select();
            }
            hitResult.acceptMouseDown(rootSvg, parentSvg, event);
            event.isHandled = true;
        } else if (hitResult === this.geometricConstruction) {
            console.log('RectangularConstruction (Idle): Hit on body, initiating drag of rectangle (future state).');
            this.geometricConstruction.select();
            event.isHandled = true;
        } else {
            // console.log('RectangularConstruction (Idle): Clicked outside of this rectangle, no action.');
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitRadius = 8;

        const hitResult = this.geometricConstruction.hitTest(mouseX, mouseY, hitRadius);

        if (!this.geometricConstruction.selected) {
            if (hitResult) {
                this.geometricConstruction.showHandles();
            } else {
                this.geometricConstruction.hideHandles();
            }
        } else {
            this.geometricConstruction.showHandles();
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        console.log('RectangularConstruction (Idle): Mouse up - no action.');
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const hitResult = this.geometricConstruction.hitTest(mouseX, mouseY);

        if (hitResult) {
            this.geometricConstruction.select();
        } else {
            // No hit, GeometricPlane will handle deselect if needed
        }
    }
}


// --- RectangularConstruction Class ---
export class RectangularConstruction extends GeometricConstruction {

    pointA = null;
    pointB = null;
    _implement = null; // Holds the RectangleImplement instance

    topLeft = null;
    topRight = null;
    bottomLeft = null;
    bottomRight = null;

    waitingForPointAState = null;
    waitingForPointBState = null;
    idleState = null;

    // REMOVED: addSelfToPlane = null;
    // REMOVED: isAddedToPlane = false;

    constructor(config = {}) {
        super(config);

        this.pointA = null;
        this.pointB = null;
        this.addSelfToPlane = config.addSelfToPlane;

        // Initialize RectangleImplement which holds x,y,width,height
        // MODIFIED: RectangleImplement no longer receives ownerConstruction as a parameter
        this._implement = new RectangleImplement(null, {
            x: 0, y: 0, width: 0, height: 0, // Initial default values
            rootSvg: this.rootSvg,
            localGroup: this.localGroup
        });

        // NEW: Explicitly assign _ownerConstruction to the implement here.
        this._implement._ownerConstruction = this;

        this.waitingForPointAState = new WaitingForPoint_A(this);
        this.waitingForPointBState = new WaitingForPoint_B(this);
        this.idleState = new IdleState(this);

        this.currentState = this.waitingForPointAState;

        // Initialize corner PointConstruction instances (controllers for point handles)
        // They will also explicitly set their _implement._ownerConstruction.
        this.topLeft = new PointConstruction({ rootSvg: this.rootSvg, parentSvg: this.localGroup });
        this.topRight = new PointConstruction({ rootSvg: this.rootSvg, parentSvg: this.localGroup });
        this.bottomLeft = new PointConstruction({ rootSvg: this.rootSvg, parentSvg: this.localGroup });
        this.bottomRight = new PointConstruction({ rootSvg: this.rootSvg, parentSvg: this.localGroup });

        this.registerObservers();
    }

    startDrawing() {
        this.currentState = this.waitingForPointAState;
        if (this._implement.visualElement && this._implement.visualElement.parentNode) {
            this._implement.removeVisual();
        }
        if (this.topLeft) this.topLeft.stop(this.rootSvg);
        if (this.topRight) this.topRight.stop(this.rootSvg);
        if (this.bottomLeft) this.bottomLeft.stop(this.rootSvg);
        if (this.bottomRight) this.bottomRight.stop(this.rootSvg);

        this.pointA = null;
        this.pointB = null;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this._implement.data.x = 0;
        this._implement.data.y = 0;
        this._implement.data.width = 0;
        this._implement.data.height = 0;

        // REMOVED: this.isAddedToPlane = false;
        console.log('RectangularConstruction: Start drawing command received. Ready to define point A.');
    }

    setPointA(x, y) {
        this.pointA = { x: x, y: y };
        this.x = x;
        this.y = y;

        if (this.topLeft) {
            this.topLeft.updatePosition(x, y, true);
            this.topLeft.createVisual(this.rootSvg, this.localGroup);
        }
    }

    setPointB(x, y) {
        this.pointB = { x: x, y: y };

        const x1 = this.pointA.x;
        const y1 = this.pointA.y;
        const x2 = x;
        const y2 = y;

        this.x = Math.min(x1, x2);
        this.y = Math.min(y1, y2);
        this.width = Math.abs(x2 - x1);
        this.height = Math.abs(y2 - y1);

        this.updateCornerPositions(true);
    }

    setConstructionVisual(rootSvg, parentSvg, x1, y1) {
        this._implement.createVisual(rootSvg, parentSvg, {
            svgType: 'rect',
            x: x1, y: y1, width: 0, height: 0,
            stroke: 'black', fill: 'none', class: 'construction-rectangle'
        });
    }

    updateConstructionVisual(x2, y2) {
        if (this._implement.visualElement && this.pointA) {
            const x1 = this.pointA.x;
            const y1 = this.pointA.y;

            this._implement.data.x = Math.min(x1, x2);
            this._implement.data.y = Math.min(y1, y2);
            this._implement.data.width = Math.abs(x2 - x1);
            this._implement.data.height = Math.abs(y2 - y1);
            this._implement.updateVisual();

            if (this.topRight) this.topRight.updatePosition(this._implement.data.x + this._implement.data.width, this._implement.data.y, true);
            if (this.bottomLeft) this.bottomLeft.updatePosition(this._implement.data.x, this._implement.data.y + this._implement.data.height, true);
            if (this.bottomRight) this.bottomRight.updatePosition(this._implement.data.x + this._implement.data.width, this._implement.data.y + this._implement.data.height, true);
            if (this.topLeft) this.topLeft.updatePosition(this._implement.data.x, this._implement.data.y, true);
        }
    }

    finalise(rootSvg, parentSvg) {
        if (this.pointA && this.pointB) {
            this._implement.data.class = 'final-rectangle';
            this._implement.data.stroke = 'black';
            this._implement.data.strokeWidth = 1;
            this._implement.data.fill = 'none';
            this._implement.updateVisual();

            this.showCornerVisuals(rootSvg, parentSvg);
        }
    }

    registerObservers() {
        if (this.topLeft) this.topLeft.addObserver(this);
        if (this.topRight) this.topRight.addObserver(this);
        if (this.bottomLeft) this.bottomLeft.addObserver(this);
        if (this.bottomRight) this.bottomRight.addObserver(this);
    }

    onConstructionChanged(construction, changeDescription) {
        if (changeDescription === 'moved') {
            if (construction instanceof PointConstruction) {
                this.updateFromCorner(construction);
                this.updateVisual();
            }
        }
    }

    updateFromCorner(movedPoint) {
        let x1 = this.topLeft.x;
        let y1 = this.topLeft.y;
        let x2 = this.topRight.x;
        let y2 = this.topRight.y;
        let x3 = this.bottomLeft.x;
        let y3 = this.bottomLeft.y;
        let x4 = this.bottomRight.x;
        let y4 = this.bottomRight.y;

        const newMinX = Math.min(x1, x2, x3, x4);
        const newMinY = Math.min(y1, y2, y3, y4);
        const newMaxX = Math.max(x1, x2, x3, x4);
        const newMaxY = Math.max(y1, y2, y3, y4);

        this.x = newMinX;
        this.y = newMinY;
        this.width = newMaxX - newMinX;
        this.height = newMaxY - newMinY;

        this.updateCornerPositions(true);
    }

    updateCornerPositions(isInternal = false) {
        if (this.topLeft) this.topLeft.updatePosition(this.x, this.y, isInternal);
        if (this.topRight) this.topRight.updatePosition(this.x + this.width, this.y, isInternal);
        if (this.bottomLeft) this.bottomLeft.updatePosition(this.x, this.y + this.height, isInternal);
        if (this.bottomRight) this.bottomRight.updatePosition(this.x + this.width, this.y + this.height, isInternal);
    }

    /**
     * Shows the visual elements of the corner PointConstruction instances (handles).
     */
    showHandles() {
        // Ensure handles are created and visible
        if (this.topLeft) {
            this.topLeft.createVisual(this.rootSvg, this.localGroup);
            this.topLeft.updateVisual();
        }
        if (this.topRight) {
            this.topRight.createVisual(this.rootSvg, this.localGroup);
            this.topRight.updateVisual();
        }
        if (this.bottomLeft) {
            this.bottomLeft.createVisual(this.rootSvg, this.localGroup);
            this.bottomLeft.updateVisual();
        }
        if (this.bottomRight) {
            this.bottomRight.createVisual(this.rootSvg, this.localGroup);
            this.bottomRight.updateVisual();
        }
    }

    /**
     * Hides the visual elements of the corner PointConstruction instances (handles).
     */
    hideHandles() {
        // Ensure handles are removed from DOM
        if (this.topLeft) this.topLeft.stop(this.rootSvg);
        if (this.topRight) this.topRight.stop(this.rootSvg);
        if (this.bottomLeft) this.bottomLeft.stop(this.rootSvg);
        if (this.bottomRight) this.bottomRight.stop(this.rootSvg);
    }

    hitTest(mouseX, mouseY, hitRadius = 8) {
        if (this.topLeft && this.topLeft.hitTest(mouseX, mouseY, hitRadius)) return this.topLeft;
        if (this.topRight && this.topRight.hitTest(mouseX, mouseY, hitRadius)) return this.topRight;
        if (this.bottomLeft && this.bottomLeft.hitTest(mouseX, mouseY, hitRadius)) return this.bottomLeft;
        if (this.bottomRight && this.bottomRight.hitTest(mouseX, mouseY, hitRadius)) return this.bottomRight;

        if (this._implement && typeof this._implement.hitTest === 'function') {
            if (this._implement.hitTest(mouseX, mouseY, hitRadius)) {
                return this;
            }
        }
        return null;
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        if (this.currentState === this.waitingForPointAState || this.currentState === this.waitingForPointBState) {
            if (this.currentState) {
                this.currentState.acceptMouseDown(rootSvg, parentSvg, event);
            }
        } else {
            const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
            const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
            const hitResult = this.hitTest(mouseX, mouseY);

            if (hitResult instanceof PointConstruction) {
                console.log('RectangularConstruction: Hit on corner point handle, delegating to point.');
                if (!this.selected) {
                    this.select();
                }
                hitResult.acceptMouseDown(rootSvg, parentSvg, event);
                event.isHandled = true;
            } else if (hitResult === this) {
                console.log('RectangularConstruction: Hit on body, initiating drag of rectangle (future state).');
                this.select();
                event.isHandled = true;
            } else {
                // console.log('RectangularConstruction: Clicked outside of this rectangle, no action.');
            }
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        if (this.currentState) {
            this.currentState.acceptMouseMove(rootSvg, parentSvg, event);
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.currentState) {
            this.currentState.acceptMouseUp(rootSvg, parentSvg, event);
        }
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        if (this.currentState) {
            if (typeof this.currentState.acceptMouseClick === 'function') {
                this.currentState.acceptMouseClick(rootSvg, parentSvg, event);
            }
        }
    }

    updateVisual() {
        if (this._implement) {
            this._implement.data.selected = this.selected;
            this._implement.updateVisual();
        }
        if (this.topLeft) this.topLeft.updateVisual();
        if (this.topRight) this.topRight.updateVisual();
        if (this.bottomLeft) this.bottomLeft.updateVisual();
        if (this.bottomRight) this.bottomRight.updateVisual();
    }

    stop(rootSvg) {
        if (this._implement) {
            this._implement.removeVisual();
        }
        if (this.topLeft) this.topLeft.stop(rootSvg);
        if (this.topRight) this.topRight.stop(rootSvg);
        if (this.bottomLeft) this.bottomLeft.stop(rootSvg);
        if (this.bottomRight) this.bottomRight.stop(rootSvg);

        super.stop();
    }

    isFinished() {
        return false;
    }
}