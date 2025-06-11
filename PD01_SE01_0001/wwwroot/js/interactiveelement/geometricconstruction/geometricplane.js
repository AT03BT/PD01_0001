/*
    wwwroot/js/interactiveelement/page8/geometricconstruction/geometricplane.js
    Version: 0.2.4 // Version increment for correct acceptMouseMove hover logic
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Geometric Plane
    ===============
*/

import { GeometricConstruction } from './geometricconstruction.js';
import { ConstructionState } from '../core/constructionstate.js'; // MODIFIED PATH
import { DrawingImplement } from '../core/drawingimplement.js';

// States for GeometricPlane
class GeometricPlaneIdleState extends ConstructionState {
    interactionHitRadius = 8;

    constructor(geometricPlane) {
        super();
        this.geometricPlane = geometricPlane;
        console.log('GeometricPlane: Entered IdleState.');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;

        const hitImplement = this.geometricPlane.hitTest(mouseX, mouseY, this.interactionHitRadius);

        let hitConstruction = null;
        if (hitImplement && hitImplement._ownerConstruction) {
            hitConstruction = hitImplement._ownerConstruction;
        }

        if (hitConstruction) {
            console.log(`GeometricPlane (Idle): Mouse Down - HitTest result: ${hitConstruction.constructor.name}. Delegating event.`);

            if (this.geometricPlane.currentlySelectedObject && this.geometricPlane.currentlySelectedObject !== hitConstruction) {
                this.geometricPlane.currentlySelectedObject.deselect();
            }

            hitConstruction.select();
            this.geometricPlane.currentlySelectedObject = hitConstruction;

            console.log(`GeometricPlane (Idle): Delegating mousedown to ${hitConstruction.constructor.name}.`);
            hitConstruction.acceptMouseDown(rootSvg, hitConstruction.localGroup, event);
            event.isHandled = true;

        } else {
            if (this.geometricPlane.currentlySelectedObject) {
                console.log('GeometricPlane (Idle): Mouse Down - No child hit. Deselecting current object.');
                this.geometricPlane.currentlySelectedObject.deselect();
                this.geometricPlane.currentlySelectedObject = null;
            } else {
                console.log('GeometricPlane (Idle): Mouse Down - No child hit and nothing selected. No action for specific objects.');
            }
            event.isHandled = true;
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;
        const interactionHitRadius = 8;

        // If something is currently selected, delegate all mousemoves to it for manipulation.
        // The selected object should handle its own state changes (e.g., drag).
        if (this.geometricPlane.currentlySelectedObject && typeof this.geometricPlane.currentlySelectedObject.acceptMouseMove === 'function') {
            this.geometricPlane.currentlySelectedObject.acceptMouseMove(rootSvg, this.geometricPlane.currentlySelectedObject.localGroup, event);
            event.isHandled = true;
        } else {
            // No object is selected, so manage hover effects for non-selected children.
            // Iterate all children (DrawingImplement) and get their ownerConstruction to manage hover.
            for (const childImplement of this.geometricPlane.children.values()) {
                const childConstruction = childImplement._ownerConstruction; // Get the controller

                if (childConstruction && !childConstruction.selected) { // Only manage hover for valid, non-selected controllers
                    const isCurrentlyHovered = childConstruction.hitTest(mouseX, mouseY, this.interactionHitRadius); // Hit test on the controller

                    if (isCurrentlyHovered && childConstruction.currentState !== childConstruction.hoverState) {
                        childConstruction.currentState = childConstruction.hoverState; // Transition to hover
                        // Visual update is handled by HoverState's constructor on entry
                    } else if (!isCurrentlyHovered && childConstruction.currentState === childConstruction.hoverState) {
                        childConstruction.currentState = childConstruction.waitingForMouseEnterState; // Transition back to Neutral
                        // Visual update is handled by WaitingForMouseEnterState's constructor on entry
                    }
                }
            }
        }
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.geometricPlane.currentlySelectedObject && typeof this.geometricPlane.currentlySelectedObject.acceptMouseUp === 'function') {
            console.log(`GeometricPlane (Idle): Delegating mouseup to currently selected ${this.geometricPlane.currentlySelectedObject.constructor.name}.`);
            this.geometricPlane.currentlySelectedObject.acceptMouseUp(rootSvg, this.geometricPlane.currentlySelectedObject.localGroup, event);
            event.isHandled = true;
        } else {
            console.log('GeometricPlane (Idle): Mouse Up - no specific action or selected object.');
        }
    }

    acceptMouseClick(rootSvg, parentSvg, event) {
        const eventX = event.clientX - rootSvg.getBoundingClientRect().left;
        const eventY = event.clientY - rootSvg.getBoundingClientRect().top;

        const clickHitImplement = this.geometricPlane.hitTest(eventX, eventY, this.interactionHitRadius);

        let clickHitConstruction = null;
        if (clickHitImplement && clickHitImplement._ownerConstruction) {
            clickHitConstruction = clickHitImplement._ownerConstruction;
        }

        if (clickHitConstruction) {
            console.log(`GeometricPlane (Idle): Mouse Click - Hit on ${clickHitConstruction.constructor.name}. Delegating.`);
            if (this.geometricPlane.currentlySelectedObject && this.geometricPlane.currentlySelectedObject !== clickHitConstruction) {
                this.geometricPlane.currentlySelectedObject.deselect();
            }
            clickHitConstruction.select();
            this.geometricPlane.currentlySelectedObject = clickHitConstruction;

            if (typeof clickHitConstruction.acceptMouseClick === 'function') {
                clickHitConstruction.acceptMouseClick(rootSvg, clickHitConstruction.localGroup, event);
            }
            event.isHandled = true;
        } else {
            if (this.geometricPlane.currentlySelectedObject) {
                console.log('GeometricPlane (Idle): Mouse Click - No child hit. Deselecting current object.');
                this.geometricPlane.currentlySelectedObject.deselect();
                this.geometricPlane.currentlySelectedObject = null;
            } else {
                console.log('GeometricPlane (Idle): Mouse Click - no child hit. No action for this plane.');
            }
            event.isHandled = true;
        }
    }
}

export class GeometricPlane extends GeometricConstruction {
    children = new Map(); // Key: ID, Value: DrawingImplement instance

    visualElement = null; // This is the <g> element for the plane
    idleState = null;

    currentlySelectedObject = null; // This holds a GeometricConstruction (the controller)

    constructor(config = {}) {
        super(config);

        this.idleState = new GeometricPlaneIdleState(this);
        this.currentState = this.idleState;

        this.currentlySelectedObject = null;
    }

    createVisual(rootSvg, parentSvg) {
        this.rootSvg = rootSvg;
        this.parentSvg = parentSvg;

        this.visualElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.visualElement.setAttribute('class', 'geometric-plane-group');

        if (this.parentSvg) {
            this.parentSvg.appendChild(this.visualElement);
            console.log(`GeometricPlane: Created visual <g> and appended to parentSvg.`);
        } else {
            console.error("GeometricPlane: No parentSvg to append visual element to during createVisual. Appending to rootSvg.");
            if (this.rootSvg) {
                this.rootSvg.appendChild(this.visualElement);
            }
        }
    }

    /**
     * Adds a DrawingImplement to this GeometricPlane.
     * @param {string} id - Unique ID for the child.
     * @param {DrawingImplement} childImplement - The DrawingImplement instance to add.
     */
    addChild(id, childImplement) {
        console.log(`GeometricPlane: Attempting to add child '${id}' (${childImplement ? childImplement.constructor.name : 'undefined'}).`);

        // Validation: Check if it's a valid DrawingImplement and has the ownerConstruction link
        // The _ownerConstruction should now be set *before* addChild is called, by the GC itself.
        if (!(childImplement instanceof DrawingImplement) || !childImplement._ownerConstruction) {
            console.error(`GeometricPlane: Attempted to add invalid DrawingImplement (missing _ownerConstruction). ID: ${id}, Implement:`, childImplement);
            return; // Block invalid implement additions
        }

        // Additional validation for context properties (rootSvg, localGroup) that are essential for visual management
        if (!childImplement.rootSvg || !childImplement.localGroup) {
            console.error(`GeometricPlane: Child implement '${id}' is missing rootSvg or localGroup context. Cannot add.`, childImplement);
            return;
        }

        if (this.children.has(id)) {
            console.warn(`GeometricPlane: Child with ID '${id}' already exists. Skipping add.`);
            return;
        }

        childImplement.localGroup = this.visualElement;

        this.children.set(id, childImplement);
        console.log(`GeometricPlane: Child implement '${id}' (${childImplement.constructor.name}) added to internal map.`);

        // Ensure the implement's visual is created and placed
        if (!childImplement.visualElement) {
            console.log(`GeometricPlane: Calling createVisual on child implement '${id}'.`);
            childImplement.createVisual(childImplement.rootSvg, childImplement.localGroup);
        } else {
            // If visual already exists, ensure it's in the correct parent and visible
            if (childImplement.visualElement.parentNode !== childImplement.localGroup) {
                console.warn(`GeometricPlane: Child implement visual for '${id}' is in wrong parent. Moving.`);
                childImplement.localGroup.appendChild(childImplement.visualElement);
            }
            if (typeof childImplement.updateVisual === 'function') {
                childImplement.updateVisual();
            }
        }

        console.log(`GeometricPlane: Child implement '${id}' successfully added and visual confirmed.`);
    }

    /**
     * Removes a child DrawingImplement from this GeometricPlane.
     * @param {string} id - Unique ID of the child to remove.
     */
    removeChild(id) {
        const childImplement = this.children.get(id);
        if (childImplement) {
            if (childImplement._ownerConstruction) {
                childImplement._ownerConstruction.deselect(); // Ensure controller is deselected
            }
            childImplement.removeVisual(); // Ask the implement to remove its visual
            this.children.delete(id);
            console.log(`GeometricPlane: Child implement '${id}' removed.`);
            if (this.currentlySelectedObject === childImplement._ownerConstruction) { // Check owner construction
                this.currentlySelectedObject = null;
            }
        }
    }

    /**
     * Performs a hit test by delegating to its child DrawingImplements.
     * @param {number} mouseX - Mouse X coordinate relative to rootSvg.
     * @param {number} mouseY - Mouse Y coordinate relative to rootSvg.
     * @param {number} hitRadius - The radius for hit detection (for points/lines).
     * @returns {DrawingImplement | null} The DrawingImplement that was hit, or null.
     */
    hitTest(mouseX, mouseY, hitRadius = 8) {
        for (const childImplement of this.children.values()) {
            if (typeof childImplement.hitTest !== 'function') {
                console.warn(`GeometricPlane: Child implement ${childImplement.constructor.name} missing hitTest method.`);
                continue;
            }
            const hitResultFromImplement = childImplement.hitTest(mouseX, mouseY, hitRadius);
            if (hitResultFromImplement) {
                return hitResultFromImplement;
            }
        }
        return null;
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseDown(rootSvg, parentSvg, event);
    }
    acceptMouseMove(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseMove(rootSvg, parentSvg, event);
    }
    acceptMouseUp(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseUp(rootSvg, parentSvg, event);
    }
    acceptMouseClick(rootSvg, parentSvg, event) {
        if (this.currentState) this.currentState.acceptMouseClick(rootSvg, parentSvg, event);
    }

    updateVisual() {
        for (const childImplement of this.children.values()) {
            if (typeof childImplement.updateVisual === 'function') {
                childImplement.updateVisual();
            }
        }
    }

    stop(rootSvg) {
        for (const childId of Array.from(this.children.keys())) {
            this.removeChild(childId);
        }
        if (this.visualElement && this.visualElement.parentNode) {
            this.visualElement.parentNode.removeChild(this.visualElement);
            this.visualElement = null;
        }
        super.stop();
    }

    isFinished() {
        return false;
    }
}