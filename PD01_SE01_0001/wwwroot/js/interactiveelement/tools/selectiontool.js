/*
    wwwroot/js/interactiveelement/page8/tools/selectiontool.js
    Version: 0.1.2 // Version increment for accurate event.isHandled flagging
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Selection Tool
    ==============
*/

import { GeometricConstruction, ConstructionState } from '../geometricconstruction.js/index.js';
import { GeometricPlane } from '../geometricconstruction/geometricplane.js';

class SelectionIdleState extends ConstructionState {
    constructor(selectionTool) {
        super();
        this.selectionTool = selectionTool;
        console.log('SelectionTool: Entered IdleState. Ready for selection/hover.');
    }

    acceptMouseDown(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;

        const hitResult = this.selectionTool.rootGeometricPlane.hitTest(mouseX, mouseY);

        if (hitResult) {
            console.log(`SelectionTool (Idle): Mouse Down - Hit on ${hitResult.constructor.name}. Delegating event to hit object.`);
            // When delegating to a hit object, pass its correct localGroup (parentSvg) for its visual element.
            hitResult.acceptMouseDown(rootSvg, hitResult.localGroup, event); // Pass the hit object's localGroup
            // event.isHandled is now set by the hit object's state if it truly handles it.
            // We only need to set it here if the SelectionTool itself wants to stop propagation
            // regardless of whether the hit object handled it (e.g., if it initiated a drag for selection).
            if (event.isHandled) { // Check if the delegated call handled it
                console.log(`SelectionTool (Idle): Delegated event was handled by ${hitResult.constructor.name}.`);
            } else {
                // If hit object didn't handle it, SelectionTool might still handle it as a general click
                console.log(`SelectionTool (Idle): Delegated event not handled by ${hitResult.constructor.name}. SelectionTool processing general click.`);
                event.isHandled = true; // Selection tool consumes the click even if hit object didn't
            }
        } else {
            console.log('SelectionTool (Idle): Mouse Down - no object hit. Starting selection box or deselecting all.');
            event.isHandled = true; // Selection tool handles the general click on empty space
        }
    }

    acceptMouseMove(rootSvg, parentSvg, event) {
        const mouseX = event.clientX - rootSvg.getBoundingClientRect().left;
        const mouseY = event.clientY - rootSvg.getBoundingClientRect().top;

        this.selectionTool.rootGeometricPlane.hitTest(mouseX, mouseY);
        // MouseMove usually doesn't set isHandled unless it's for drag/resize initiation
    }

    acceptMouseUp(rootSvg, parentSvg, event) {
        console.log('SelectionTool (Idle): Mouse Up - processing click for selection.');
    }
}

export class SelectionTool extends GeometricConstruction {
    // NEW: Reference to the root GeometricPlane
    rootGeometricPlane = null;

    constructor(config = {}) {
        super(config);
        this.rootGeometricPlane = config.drawingPlane; // drawingPlane from config is now our rootGeometricPlane
        // Ensure the rootGeometricPlane has been created and has its visualElement before it's used here.

        this.idleState = new SelectionIdleState(this);
        this.currentState = this.idleState;
    }

    isFinished() {
        return false; // Selection tool is always active and never "finished"
    }

    stop() {
        super.stop();
    }
}