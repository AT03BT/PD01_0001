/*
    wwwroot/js/interactiveelement/page8/implements/pointimplement.js
    Version: 0.1.4 // Version increment for removing ownerConstruction from constructor
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Point Implement
    ===============
    Represents the data and visual for a drawn point.
*/

import { DrawingImplement } from '../core/drawingimplement.js';

export class PointImplement extends DrawingImplement {
    constructor(id, config = {}) { // Modified: No ownerConstruction parameter
        super(id, { ...config, type: 'point' });
        // _ownerConstruction will be explicitly assigned by the owning GeometricConstruction.

        this.data.x = config.x || 0;
        this.data.y = config.y || 0;
        this.data.r = config.r || 3; // Default radius
        this.data.fill = config.fill || 'black';
        this.data.stroke = config.stroke || 'black';
        this.data.strokeWidth = config.strokeWidth || 1;
        this.data.class = config.class || 'block-point'; // CSS class
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
            this.visualElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.visualElement.setAttribute('class', this.data.class);
            this.visualElement.setAttribute('r', this.data.r.toString());
            this.visualElement.setAttribute('visibility', 'hidden');

            if (this.localGroup) {
                this.localGroup.appendChild(this.visualElement);
            } else if (this.rootSvg) { // Fallback
                this.rootSvg.appendChild(this.visualElement);
                console.warn(`PointImplement: No localGroup for ${this.id}. Appending to rootSvg.`);
            } else {
                console.error(`PointImplement: Cannot append visual for ${this.id}. Neither localGroup nor rootSvg available.`);
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
            this.visualElement.setAttribute('cx', this.data.x.toString());
            this.visualElement.setAttribute('cy', this.data.y.toString());
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
     * @param {number} hitRadius - The radius for hit detection (e.g., 8 for user interaction).
     * @returns {DrawingImplement|null} The PointImplement instance if hit, null otherwise.
     */
    hitTest(mouseX, mouseY, hitRadius) {
        if (!this.visualElement) {
            return null;
        }
        const currentCx = parseFloat(this.visualElement.getAttribute('cx') || '0');
        const currentCy = parseFloat(this.visualElement.getAttribute('cy') || '0');
        const distance = Math.sqrt(Math.pow(mouseX - currentCx, 2) + Math.pow(mouseY - currentCy, 2));

        const effectiveHitRadius = hitRadius !== undefined ? hitRadius : this.data.r;

        // console.log(`PointImplement: hitTest for Point at (${currentCx},${currentCy}) with mouse (${mouseX},${mouseY}). Distance: ${distance}. Hit: ${distance <= effectiveHitRadius}`);

        if (distance <= effectiveHitRadius) {
            return this;
        } else {
            return null;
        }
    }
}