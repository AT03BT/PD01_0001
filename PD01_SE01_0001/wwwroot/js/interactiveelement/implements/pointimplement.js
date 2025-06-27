/*
    wwwroot/js/interactiveelement/implements/pointimplement.js
    Version: 0.1.8 // Version increment for correct currentState comparison
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Point Implement
    ===============
*/

import { DrawingImplement } from '../core/drawingimplement.js';

export class PointImplement extends DrawingImplement {
    constructor(id, config = {}) {
        super(id, { ...config, type: 'point' });

        this.data.x = config.x || 0;
        this.data.y = config.y || 0;
        this.data.r = config.r || 3;
        this.data.fill = config.fill || 'black';
        this.data.stroke = config.stroke || 'black';
        this.data.strokeWidth = config.strokeWidth || 1;
        this.data.class = config.class || 'block-point';

        this.data.selected = false;
        this.data.currentState = null;
        this.data.hoverState = null;
    }

    createVisual(rootSvg, localGroup, attributes = {}) {
        this.rootSvg = rootSvg;
        this.localGroup = localGroup;

        if (!this.visualElement) {
            this.visualElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.visualElement.setAttribute('class', this.data.class);
            this.visualElement.setAttribute('r', this.data.r.toString());
            this.visualElement.setAttribute('visibility', 'hidden');

            if (this.localGroup) {
                this.localGroup.appendChild(this.visualElement);
            } else if (this.rootSvg) {
                this.rootSvg.appendChild(this.visualElement);
                console.warn(`PointImplement: No localGroup for ${this.id || 'null'}. Appending to rootSvg.`);
            } else {
                console.error(`PointImplement: Cannot append visual for ${this.id || 'null'}. Neither localGroup nor rootSvg available.`);
            }
        }
        for (const key in attributes) {
            this.visualElement.setAttribute(key, attributes[key]);
        }
        this.updateVisual();
        this.visualElement.setAttribute('visibility', 'visible');
    }

    updateVisual() {
        if (this.visualElement) {
            this.visualElement.setAttribute('cx', this.data.x.toString());
            this.visualElement.setAttribute('cy', this.data.y.toString());

            let newFill = 'black'; // Default to black
            let newStroke = 'black';
            let newStrokeWidth = 1;

            if (this.data.selected) {
                newStroke = 'blue';
                newStrokeWidth = 2;
                newFill = 'black'; // Selected object has black fill
            } else {
                // Not selected, check hover
                if (this.data.currentState && this.data.hoverState && // Ensure states are defined
                    this.data.currentState.constructor.name === this.data.hoverState.constructor.name) { // MODIFIED: Compare constructor names
                    newFill = 'fuchsia'; // Hover fill
                } else {
                    newFill = 'black'; // Default fill when not selected and not hovered
                }
            }

            this.visualElement.style.fill = newFill;
            this.visualElement.style.stroke = newStroke;
            this.visualElement.style.strokeWidth = newStrokeWidth.toString();

            console.log(`PointImplement: Updated visual for ID ${this.id || 'null'}. Selected: ${this.data.selected}, CurrentState: ${this.data.currentState ? this.data.currentState.constructor.name : 'None'}, Applied Fill: ${newFill}, Stroke: ${newStroke}`);
        }
    }

    hitTest(mouseX, mouseY, hitRadius) {
        if (!this.visualElement) {
            return null;
        }
        const currentCx = parseFloat(this.visualElement.getAttribute('cx') || '0');
        const currentCy = parseFloat(this.visualElement.getAttribute('cy') || '0');
        const distance = Math.sqrt(Math.pow(mouseX - currentCx, 2) + Math.pow(mouseY - currentCy, 2));

        const effectiveHitRadius = hitRadius !== undefined ? hitRadius : this.data.r;

        if (distance <= effectiveHitRadius) {
            return this;
        } else {
            return null;
        }
    }
}