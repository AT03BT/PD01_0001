﻿/*
    wwwroot/js/interactiveelement/geometricconstruction/geometricplane.js
    Version: 0.2.5 // Version increment for streamlined hover logic and import fixes
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Geometric Plane
    ===============
*/

import { ConstructionState } from '../core/constructionstate.js'; // CORRECTED PATH: Imports ConstructionState from the 'core' folder
import { GeometricConstruction } from './geometricconstruction.js'; // This path is correct
import { PointConstruction } from './pointconstruction.js'; // This path is correct
import { DrawingImplement } from '../core/drawingimplement.js'; // This path is correct

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
            // If no object is hit, and there was a currently selected object, deselect it.
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
            const currentHitImplement = this.geometricPlane.hitTest(mouseX, mouseY, this.interactionHitRadius);
            const currentHitConstruction = currentHitImplement ? currentHitImplement._ownerConstruction : null;

            // Loop through all children to manage their hover states (unhover previous, hover current)
            for (const childImplement of this.geometricPlane.children.values()) {
                const childConstruction = childImplement._ownerConstruction;

                // Ensure childConstruction exists and is not selected
                if (childConstruction && !childConstruction.selected) {
                    if (childConstruction === currentHitConstruction) {
                        // This child is now hovered. Transition to HoverState if not already there.
                        if (childConstruction.currentState !== childConstruction.hoverState) {
                            childConstruction.currentState = childConstruction.hoverState;
                            childConstruction.updateVisual(); // Explicitly update visual on state change
                        }
                    } else if (childConstruction.currentState === childConstruction.hoverState) {
                        // This child was previously hovered but no longer is. Transition back to Neutral.
                        childConstruction.currentState = childConstruction.waitingForMouseEnterState;
                        childConstruction.updateVisual(); // Explicitly update visual on state change
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
            // Deselect any previously selected object if it's different from the new hit
            if (this.geometricPlane.currentlySelectedObject && this.geometricPlane.currentlySelectedObject !== clickHitConstruction) {
                this.geometricPlane.currentlySelectedObject.deselect(); // This will also update its visual
            }

            // Select the new hit object
            clickHitConstruction.select(); // This will set `selected = true` and call `updateVisual`
            this.geometricPlane.currentlySelectedObject = clickHitConstruction;

            if (typeof clickHitConstruction.acceptMouseClick === 'function') {
                clickHitConstruction.acceptMouseClick(rootSvg, clickHitConstruction.localGroup, event);
            }
            event.isHandled = true;
        } else {
            // If no object is hit, and there was a currently selected object, deselect it.
            if (this.geometricPlane.currentlySelectedObject) {
                console.log('GeometricPlane (Idle): Mouse Click - No child hit. Deselecting current object.');
                this.geometricPlane.currentlySelectedObject.deselect(); // This will also update its visual
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
        this.currentState = this.idleState; // Initialize with idle state

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
        // Use window.DrawingImplement for the instanceof check due to potential module loading nuances.
        if (!(childImplement instanceof window.DrawingImplement) || !childImplement._ownerConstruction) {
            console.error(`GeometricPlane: Attempted to add invalid DrawingImplement (missing _ownerConstruction). ID: ${id}, Implement:`, childImplement);
            return;
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
            childImplement.removeVisual();
            this.children.delete(id);
            console.log(`GeometricPlane: Child implement '${id}' removed.`);
            if (this.currentlySelectedObject === childImplement._ownerConstruction) {
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
        // This method should iterate through all children and call their updateVisual
        // This is primarily called by GeometricPlane's idle state to refresh all children's visuals
        for (const childImplement of this.children.values()) {
            if (typeof childImplement.updateVisual === 'function') {
                childImplement.updateVisual();
            }
        }
    }

    isFinished() {
        return false;
    }
}