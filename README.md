# PD01_0001

## Overview

PD01_0001 is an interactive geometry application built with modular JavaScript and ASP.NET Core MVC. It enables users to construct, manipulate, and visualize geometric objects on a web-based canvas.

## Table of Contents

- [Overview](#overview)
- [Version Numbering Principles](#version-numbering-principles)
- [Versioning of Diagrams vs. Code Modules](#versioning-of-diagrams-vs-code-modules)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Version Numbering Principles

This project adheres to a versioning logic based on common [Semantic Versioning](https://semver.org/) principles for its individual JavaScript modules. Each file's version number follows the `MAJOR.MINOR.PATCH` format, indicating the nature and impact of changes made to that specific file.

---

### `MAJOR` (The First Number)

* **Purpose:** Signifies a **significant architectural change**, a fundamental re-conceptualization of a module's role, or a large-scale refactoring that might introduce backward incompatibilities in how other modules are designed to interact with it internally.
* **Increment Reason:** This number is incremented when a component's core responsibilities, its relationship to other major components, or its inheritance hierarchy undergoes a substantial overhaul.

### `MINOR` (The Second Number)

* **Purpose:** Indicates **new features, significant functional additions**, or notable internal refactorings that enhance the module's capabilities without breaking existing public APIs.
* **Increment Reason:** It is incremented when a module gains new capabilities (e.g., adding new interactive states, supporting new data structures, substantial performance improvements) or undergoes a clean, non-breaking internal redesign.

### `PATCH` (The Third Number)

* **Purpose:** Represents **bug fixes, minor adjustments, small improvements, or debugging-related changes.** It signifies that the module's core functionality and existing features remain the same, but smaller issues have been resolved or minor enhancements have been made.
* **Increment Reason:** This is the most frequently incremented number, used for corrections to logic, import path fixes, adjustments to console logging for debugging, or very small, isolated improvements.

---

By following these principles, we aim to provide clear version history for each module, enabling easier tracking of changes, more reliable integration, and smoother collaborative development.

### Versioning of Diagrams vs. Code Modules

This project employs a dual versioning strategy to provide clarity across different aspects of its development:

1.  **Module Versioning (for Individual JavaScript Files):**
    * **Scope:** Applies to each individual `.js` file (module) within the `wwwroot/js/interactiveelement/` directory structure.
    * **Format:** Follows `MAJOR.MINOR.PATCH` (e.g., `pointconstruction.js` Version `1.2.11`).
    * **Meaning:**
        * `MAJOR`: Breaking change to that specific module's public API.
        * `MINOR`: New features or significant functional additions *within that module* (backward-compatible).
        * `PATCH`: Bug fixes, internal refactoring, or minor adjustments *specific to that module*.
    * **Purpose:** Provides fine-grained version control and change tracking for individual components, aiding in module-level development and debugging.

2.  **Application Versioning (for Documentation Diagrams):**
    * **Scope:** Applies to the overall state of the *entire application's architecture and design*, documented by the diagrams within the `/docs/diagrams/` directory.
    * **Format:** Follows `MAJOR.MINOR.PATCH` (e.g., `/docs/diagrams/v1.0.0/`).
    * **Meaning:**
        * `MAJOR`: Fundamental architectural overhaul or a major application release with breaking changes to its overall design.
        * `MINOR`: Significant new features or capabilities added to the *application as a whole*.
        * `PATCH`: Bug fixes or minor improvements affecting the *overall application's design* as depicted in diagrams.
    * **Purpose:** Captures snapshots of the application's high-level design at key milestones or releases, providing historical context and ensuring documentation reflects the state of the overall application.

**Key Difference:**

While both use `MAJOR.MINOR.PATCH`, the **Application Version** is a coarse-grained version that increments less frequently, reflecting the stability and feature set of the entire system's documented design. The **Module Version** is a fine-grained version that increments frequently, reflecting granular changes to individual code components. They serve different purposes for tracking the project's evolution.

## Contribution Guidelines

Please increment the version number in the relevant file header or diagram folder when making changes. See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

This project is licensed under the [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/).