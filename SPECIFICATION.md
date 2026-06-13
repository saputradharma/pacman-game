# Pacman Game Specification

## Project Overview
A web-based, high-quality 2D Pacman game built using Phaser 3 and TypeScript, bundled with Vite.

## Technical Stack
- **Engine:** Phaser 3 (2D Game Engine)
- **Language:** TypeScript
- **Bundler:** Vite
- **Testing:** Vitest

## Core Mechanics & Features

### 1. Movement & Controls
- Pacman moves continuously in the current direction.
- Direction changes only when a turn is possible at an intersection.
- Input: Arrow keys or WASD for directional control.

### 2. Maze & Environment
- A tile-based maze layout.
- Walls that prevent movement (collisions).
- Pellets/Dots distributed throughout the maze.
- Power pellets that temporarily change game state (Ghost vulnerability).

### 3. Game Elements
- **Pacman:** The player character with mouth animation and directionality.
- **Ghosts:** Enemy characters with distinct AI behaviors (e.g., Chase, Scatter, Frightened).
- **Pellets:** Items to collect for score increases.
- **Power Pellets:** Items that change ghost behavior.

### 4. Game Rules & Logic
- **Scoring System:** Points awarded for eating pellets and ghosts.
- **Lives System:** Player loses a life upon collision with a ghost (unless frightened).
- **Game States:** Start Screen, Playing, Game Over, Level Complete.
- **AI Behavior:** Ghosts should move through the maze using pathfinding or simple movement rules.

## Development Workflow (TDD)
1.  **Plan**: Define requirements for each module.
2.  **Check/Simplify**: Review plans for complexity and risks.
3.  **Test (RED)**: Write a failing test case for the specific mechanic.
4.  **Implement (GREEN)**: Implement code to make tests pass.
5.  **Review**: Final check of implementation.

## File Structure (Proposed)
- `src/main.ts`: Entry point and Phaser config.
- `src/scenes/MainScene.ts`: Primary game scene.
- `src/entities/Pacman.ts`: Pacman logic and movement.
- `src/entities/Ghost.ts`: Ghost AI and behavior.
- `src/map/Maze.ts`: Maze generation and tile data.
- `src/constants/Constants.ts`: Game constants (speeds, sizes).
