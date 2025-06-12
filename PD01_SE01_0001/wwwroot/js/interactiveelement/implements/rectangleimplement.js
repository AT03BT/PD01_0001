/*
    wwwroot/js/interactiveelement/implements/rectangleimplement.js
    Version: 0.1.4 // Version increment for removing ownerConstruction from constructor
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Rectangle Implement
    ===================
    Represents the data and visual for a drawn rectangle.
*/

import { DrawingImplement } from '../core/drawingimplement.js';

export class RectangleImplement extends DrawingImplement {
    constructor(id, config = {}) { // Modified: No ownerConstruction parameter
        super(id, { ...config, type: 'rectangle' });
        // _ownerConstruction will be explicitly assigned by the owning GeometricConstruction.

        this.data.x = config.x || 0;
        this.data.y = config.y || 0;
        this.data.width = config.width || 0;
        this.data.height = config.height || 0;
        this.data.fill = config.fill || 'none';
        this.data.stroke = config.stroke || 'black';
        this.data.strokeWidth = config.strokeWidth || 1;
        this.data.class = config.class || 'final-rectangle'; // CSS class
    }

    /**
     * Creates and appends the SVG visual element to the localGroup.
     * Overrides DrawingImplement.createVisual.
     * @param {SVGSVGElement} rootSvg - The main SVG canvas.
     * @param {SVGGElement} localGroup - The SVG <g> element where this visual should be appended.
     * @param {object} [attributes] - Optional attributes to set on the visual element initially.
     */
    createVisual(rootSvg, localGroup, attributes = {}) {
        this.rootSvg = rootSvg; // Ensure these are set for hitTest and parenting
        this.localGroup = localGroup;

        if (!this.visualElement) { // Only create if it doesn't exist
            this.visualElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this.visualElement.setAttribute('class', this.data.class);
            this.visualElement.setAttribute('fill', this.data.fill);
            this.visualElement.setAttribute('visibility', 'hidden'); // Initially hidden

            if (this.localGroup) {
                this.localGroup.appendChild(this.visualElement);
            } else if (this.rootSvg) { // Fallback
                this.rootSvg.appendChild(this.visualElement);
                console.warn(`RectangleImplement: No localGroup for ${this.id}. Appending to rootSvg.`);
            } else {
                console.error(`RectangleImplement: Cannot append visual for ${this.id}. Neither localGroup nor rootSvg available.`);
            }
        }
        // Apply initial attributes passed in
        for (const key in attributes) {
            this.visualElement.setAttribute(key, attributes[key]);
        }

        this.updateVisual(); // Update attributes and make visible.
        this.visualElement.setAttribute('visibility', 'visible');
    }

    /**
     * Updates the SVG visual element's attributes based on internal data.
     * Overrides DrawingImplement.updateVisual.
     */
    updateVisual() {
        if (this.visualElement) {
            this.visualElement.setAttribute('x', this.data.x.toString());
            this.visualElement.setAttribute('y', this.data.y.toString());
            this.visualElement.setAttribute('width', this.data.width.toString());
            this.visualElement.setAttribute('height', this.data.height.toString());
            this.visualElement.style.fill = this.data.fill;
            this.visualElement.style.stroke = this.data.stroke;
            this.visualElement.style.strokeWidth = this.data.strokeWidth.toString();
        }
    }

    /**
     * Performs a hit test for the given mouse coordinates.
     * Overrides DrawingImplement.hitTest.
     * @param {number} mouseX - Mouse X coordinate relative to rootSvg.
     * @param {number} mouseY - Mouse Y coordinate relative to rootSvg.
     * @param {number} hitRadius - Not typically used for rect body, but kept for consistency.
     * @returns {DrawingImplement|null} The RectangleImplement instance if hit, null otherwise.
     */
    hitTest(mouseX, mouseY, hitRadius) {
        if (!this.visualElement) {
            return null;
        }
        // Check if mouse is within the rectangle's bounds
        const isHit = mouseX >= this.data.x && mouseX <= (this.data.x + this.data.width) &&
            mouseY >= this.data.y && mouseY <= (this.data.y + this.data.height);

        // console.log(`RectangleImplement: hitTest for Rect at (${this.data.x},${this.data.y},${this.data.width},${this.data.height}) with mouse (${mouseX},${mouseY}). Hit: ${isHit}`);

        if (isHit) {
            return this;
        } else {
            return null;
        }
    }
}