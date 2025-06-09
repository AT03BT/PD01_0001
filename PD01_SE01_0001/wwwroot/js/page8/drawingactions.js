/*
    wwwroot/js/interactiveelement/page8/drawingactions.js
    Version: 0.0.7 // Version increment for removing addSelfToPlane callback
    (c) 2024, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Drawing Actions
    ===============
*/
import { TaskQueue } from './taskqueue.js';
import { PointConstruction } from './geometricconstruction/pointconstruction.js';
import { RectangularConstruction } from './geometricconstruction/rectangularconstruction.js';
import { GeometricPlane } from './geometricconstruction/geometricplane.js';

export const DrawingActions = {

    geometricConstructions: null,
    rootGeometricPlane: null,

    init: function (config) {
        console.log("Initializing Drawing Actions");
        this.rootGeometricPlane = config.rootGeometricPlane;
        this.getGeometricConstructions();
        document.querySelectorAll(config.selectorString).forEach(button => {
            button.addEventListener('click', () => {
                console.log("Drawing button clicked");
                const shapeIdentifier = button.getAttribute('data-shape-class');
                const newDrawingTool = this.getDrawingTool(shapeIdentifier);

                if (newDrawingTool) {
                    TaskQueue.enqueueDrawingTask(newDrawingTool);
                } else {
                    console.error("Cannot create drawing tool for: " + button.textContent);
                }
            });
        });
    },

    getGeometricConstructions: function () {
        this.geometricConstructions = new Map([
            ["sp01_pt01_0001", PointConstruction],
            ["sp01_rt01_0001", RectangularConstruction],
        ]);
    },

    getDrawingTool: function (shapeIdentifier) {
        const GeometricConstructionClass = this.geometricConstructions.get(shapeIdentifier);

        if (GeometricConstructionClass) {
            // REMOVED: addSelfToPlaneCallback definition. TaskManager will handle adding to plane.
            return new GeometricConstructionClass({
                rootSvg: this.rootGeometricPlane.rootSvg,
                localGroup: this.rootGeometricPlane.visualElement
                // REMOVED: addSelfToPlane: addSelfToPlaneCallback
            });
        } else {
            console.log("Unknown shape identifier: " + shapeIdentifier);
            throw new Error("Unknown shape type: " + shapeIdentifier);
        }
    }
};