Tech Stack:
*   Engine: Phaser 3
*   Language: TypeScript
*   Bundler/Build Tool: Vite
*   Testing Framework: Vitest

Architecture & Foundation:
*   Scene Hierarchy: BootScene (Preload), MenuScene, GameScene, GameOverScene.
*   Coordinate System: Tile-based source of truth. Utility to convert between TileCoord {x, y} and PixelCoord {x, y}.
*   Communication: Use Phaser's built-in scene events for cross-component communication (e.g., this.events.emit('pellet_eaten')).
*   Configuration: A simple const LEVEL_CONFIG object to store parameters like speeds and timings.
*   Input Handling: A buffered direction (a single nextDirection variable) within the Pacman class/component for responsive turns at intersections.

Implementation Phases:

1.  Phase 1: Project Setup & Foundation
    *   Initialize Vite + TypeScript project.
    *   Install Phaser 3 and Vitest.
    *   Implement basic Scene structure and LEVEL_CONFIG.
2.  Phase 2: Grid & Maze Engine
    *   Define the maze data (a simple 2D array/grid).
    *   Create a Grid utility for tile-to-pixel conversion and wall detection (isWall(tile)).
    *   Render the maze in Phaser using simple colored rectangles.
3.  Phase 3: Pacman & Movement
    *   Implement Pacman entity with smooth movement (interpolation between tiles).
    *   Integrate buffered input handling for responsive turns.
    *   Collision detection against the grid.
    *   Pellet system: consuming pellets and emitting PELLET_EATEN events.
4.  Phase 4: Ghost AI & State Machine
    *   Implement the Ghost state machine (SCATTER, CHASE, FRIGHTENED, EATEN, IN_HOUSE).
    *   Develop individual targeting strategies for ghosts (Blinky, Pinky, Inky, Clyde).
    *   Intersection-based movement logic.
5.  Phase 5: Game Mechanics & Interaction
    *   Power Pellet mechanism $\rightarrow$ trigger ghost FRIGHTENED state via scene events.
    *   Pacman vs Ghost collision (Death/Eating ghosts).
    *   Scoring and Life management.
6.  Phase 6: UI & Polish
    *   HUD (Score, Lives) in Phaser.
    *   Menu and Game Over screens.

## Development Workflow (TDD)
1.  **Plan**: Define requirements for each module.
2.  **Check/Simplify**: Review plans for complexity and risks.
3.  **Test (RED)**: Write a failing test case for the specific mechanic.
4.  **Implement (GREEN)**: Implement code to make tests pass.
5.  **Review**: Final check of implementation.
