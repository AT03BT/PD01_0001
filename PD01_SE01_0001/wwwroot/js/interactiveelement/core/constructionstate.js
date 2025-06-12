/*
    wwwroot/js/interactiveelement/core/constructionstate.js
    Version: 0.1.0
    (c) 2025, Minh Tri Tran, with assistance from Google's Gemini - Licensed under CC BY 4.0
    https://creativecommons.org/licenses/by/4.0/

    Construction State (Base Class for State Pattern)
    =================================================
*/

export class ConstructionState {
    geometricConstruction = null;

    constructor() {
        // geometricConstruction will be set when the state is assigned.
    }

    // Default empty implementations for all event handlers.
    // Subclasses will override the methods they need to handle.
    acceptMouseDown(rootSvg, parentSvg, event) { }
    acceptMouseUp(rootSvg, parentSvg, event) { }
    acceptMouseMove(rootSvg, parentSvg, event) { }
    acceptMouseClick(rootSvg, parentSvg, event) { }
    acceptKeyDown(rootSvg, parentSvg, event) { }
    acceptKeyUp(rootSvg, parentSvg, event) { }
    acceptKeyPress(rootSvg, parentSvg, event) { }
}