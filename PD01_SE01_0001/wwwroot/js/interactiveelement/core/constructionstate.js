/*
    wwwroot/js/interactiveelement/page8/core/constructionstate.js
    Version: 0.1.0
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Construction State
    ==================
    Base class for all state objects within GeometricConstruction subclasses.
*/

export class ConstructionState {
    geometricConstruction = null; // Reference to the GeometricConstruction owning this state

    // Base accept methods, to be overridden by concrete states
    acceptMouseDown(rootSvg, parentSvg, event) { }
    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseMove(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
    acceptKeyDown(rootSvg, parentSvg, event) { }
    acceptKeyUp(rootSvg, parentSvg, event) { }
    acceptKeyPress(rootSvg, parentSvg, event) { }
}