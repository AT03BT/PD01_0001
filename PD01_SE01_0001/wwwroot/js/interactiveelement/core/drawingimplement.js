/*
    wwwroot/js/interactiveelement/core/drawingimplement.js
    Version: 0.1.5 // Version increment for temporary global export and ownerConstruction getter/setter
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Drawing Implement (Base Class for Drawn Objects)
    ===============================================
*/

export class DrawingImplement {
    id = null;             // Unique identifier for the drawing implement
    type = 'abstract';     // Type of the implement (e.g., 'point', 'rectangle')
    data = {};             // Geometric data (x, y, width, height, radius, etc.)
    visualElement = null;  // The actual SVG element (e.g., <circle>, <rect>)

    rootSvg = null;        // The main SVG canvas
    localGroup = null;     // The SVG <g> element where this visual is appended

    _ownerConstruction = null; // Reference back to the owning GeometricConstruction

    constructor(id, config = {}) {
        this.id = id;
        this.type = config.type || this.type;
        this.data = config.data || {};
        this.rootSvg = config.rootSvg || null;
        this.localGroup = config.localGroup || null;
        this.visualElement = null;
        // _ownerConstruction will be assigned directly by the GeometricConstruction that owns this implement.
    }

    // NEW: Getter/Setter for _ownerConstruction to ensure consistent access
    get ownerConstruction() {
        return this._ownerConstruction;
    }

    set ownerConstruction(value) {
        this._ownerConstruction = value;
    }

    /**
     * Creates and appends the SVG visual element to the localGroup.
     * This method must be overridden by subclasses.
     * @param {SVGSVGElement} rootSvg - The root SVG element.
     * @param {SVGGElement} localGroup - The SVG <g> element where this visual should be appended.
     * @param {object} [attributes] - Optional attributes to set on the visual element initially.
     */
    createVisual(rootSvg, localGroup, attributes = {}) {
        console.error(`DrawingImplement: createVisual must be overridden by subclass ${this.constructor.name}.`);
    }

    /**
     * Updates the SVG visual element's attributes based on internal data.
     * This method must be overridden by subclasses.
     */
    updateVisual() {
        console.error(`DrawingImplement: updateVisual must be overridden by subclass ${this.constructor.name}.`);
    }

    /**
     * Performs a hit test for the given mouse coordinates.
     * This method must be overridden by subclasses.
     * @param {number} mouseX - Mouse X coordinate relative to rootSvg.
     * @param {number} mouseY - Mouse Y coordinate relative to rootSvg.
     * @param {number} hitRadius - The radius for hit detection (for points/lines).
     * @returns {DrawingImplement|null} The DrawingImplement instance if hit, null otherwise.
     */
    hitTest(mouseX, mouseY, hitRadius) {
        console.error(`DrawingImplement: hitTest must be overridden by subclass ${this.constructor.name}.`);
        return null;
    }

    /**
     * Converts the implement's data to a JSON string for persistence.
     * This method should be overridden by subclasses for specific data.
     * @returns {string} JSON string representation.
     */
    toJSON() {
        return JSON.stringify({ id: this.id, type: this.type, data: this.data });
    }

    /**
     * Removes the visual element from the DOM.
     */
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