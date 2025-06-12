/*
    wwwroot/js/interactiveelement/core/drawingimplement.js
    Version: 0.1.5 // Version increment for temporary global export for debugging
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Drawing Implement (Base Class for Drawn Objects)
    ===============================================
*/

export class DrawingImplement {
    id = null;
    type = 'abstract';
    data = {};
    visualElement = null;

    rootSvg = null;
    localGroup = null;

    _ownerConstruction = null;

    constructor(id, config = {}) {
        this.id = id;
        this.type = config.type || this.type;
        this.data = config.data || {};
        this.rootSvg = config.rootSvg || null;
        this.localGroup = config.localGroup || null;
        this.visualElement = null;
    }

    createVisual(rootSvg, localGroup, attributes = {}) {
        console.error(`DrawingImplement: createVisual must be overridden by subclass ${this.constructor.name}.`);
    }

    updateVisual() {
        console.error(`DrawingImplement: updateVisual must be overridden by subclass ${this.constructor.name}.`);
    }

    hitTest(mouseX, mouseY, hitRadius) {
        console.error(`DrawingImplement: hitTest must be overridden by subclass ${this.constructor.name}.`);
        return null;
    }

    toJSON() {
        return JSON.stringify({ id: this.id, type: this.type, data: this.data });
    }

    removeVisual() {
        if (this.visualElement && this.visualElement.parentNode) {
            this.visualElement.parentNode.removeChild(this.visualElement);
            this.visualElement = null;
            console.log(`DrawingImplement: Visual for ${this.id} removed.`);
        }
    }
}

// NEW: Temporarily expose DrawingImplement globally for debugging module loading issues.
// This is NOT a permanent solution for production code.
window.DrawingImplement = DrawingImplement;