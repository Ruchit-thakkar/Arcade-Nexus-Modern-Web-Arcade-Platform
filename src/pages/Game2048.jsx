import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  Square,
  Zap,
  RotateCcw,
  Trophy,
  BrainCircuit,
} from "lucide-react";
import { Link } from "react-router-dom";

// ==========================================
// LOGIC CLASSES (Unchanged)
// ==========================================

class Tile {
  constructor(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }

  clone() {
    return new Tile({ x: this.x, y: this.y }, this.value);
  }
}

class Grid {
  constructor(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }

  empty() {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      const row = (cells[x] = []);
      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
    return cells;
  }

  fromState(state) {
    const cells = [];
    for (let x = 0; x < this.size; x++) {
      const row = (cells[x] = []);
      for (let y = 0; y < this.size; y++) {
        const tile = state[x][y];
        row.push(tile ? new Tile(tile, tile.value) : null);
      }
    }
    return cells;
  }

  randomAvailableCell() {
    const cells = this.availableCells();
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  }

  availableCells() {
    const cells = [];
    this.eachCell((x, y, tile) => {
      if (!tile) cells.push({ x: x, y: y });
    });
    return cells;
  }

  eachCell(callback) {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }

  cellsAvailable() {
    return !!this.availableCells().length;
  }

  cellAvailable(cell) {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell) {
    return !!this.cellContent(cell);
  }

  cellContent(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }

  insertTile(tile) {
    this.cells[tile.x][tile.y] = tile;
  }

  removeTile(tile) {
    this.cells[tile.x][tile.y] = null;
  }

  withinBounds(position) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  clone() {
    const newGrid = new Grid(this.size, this.cells);
    newGrid.playerTurn = this.playerTurn;
    return newGrid;
  }

  // --- Game Logic ---

  prepareTiles() {
    this.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile, cell) {
    this.cells[tile.x][tile.y] = null;
    this.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  getVector(direction) {
    const map = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };
    return map[direction];
  }

  move(direction) {
    // 0: up, 1: right, 2: down, 3: left
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;
    let score = 0;
    let won = false;

    this.prepareTiles();

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { x: x, y: y };
        const tile = this.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.insertTile(merged);
            this.removeTile(tile);
            tile.updatePosition(positions.next);
            score += merged.value;

            if (merged.value === 2048) won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (cell.x !== tile.x || cell.y !== tile.y) {
            moved = true;
          }
        }
      });
    });

    return { moved, score, won };
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] };
    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    return traversals;
  }

  findFarthestPosition(cell, vector) {
    let previous;
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.withinBounds(cell) && this.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell,
    };
  }

  movesAvailable() {
    return this.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.cellContent({ x, y });
        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction);
            const cell = { x: x + vector.x, y: y + vector.y };
            const other = this.cellContent(cell);
            if (other && other.value === tile.value) return true;
          }
        }
      }
    }
    return false;
  }

  // --- AI Heuristics ---

  smoothness() {
    let smoothness = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.cellOccupied({ x, y })) {
          const value =
            Math.log(this.cellContent({ x, y }).value) / Math.log(2);
          for (let direction = 1; direction <= 2; direction++) {
            const vector = this.getVector(direction);
            const targetCell = this.findFarthestPosition({ x, y }, vector).next;

            if (this.cellOccupied(targetCell)) {
              const target = this.cellContent(targetCell);
              const targetValue = Math.log(target.value) / Math.log(2);
              smoothness -= Math.abs(value - targetValue);
            }
          }
        }
      }
    }
    return smoothness;
  }

  monotonicity2() {
    const totals = [0, 0, 0, 0];

    // Left/Right
    for (let x = 0; x < 4; x++) {
      let current = 0;
      let next = current + 1;
      while (next < 4) {
        while (next < 4 && !this.cellOccupied({ x, y: next })) next++;
        if (next >= 4) next--;
        const currentValue = this.cellOccupied({ x, y: current })
          ? Math.log(this.cellContent({ x, y: current }).value) / Math.log(2)
          : 0;
        const nextValue = this.cellOccupied({ x, y: next })
          ? Math.log(this.cellContent({ x, y: next }).value) / Math.log(2)
          : 0;
        if (currentValue > nextValue) totals[0] += nextValue - currentValue;
        else if (nextValue > currentValue)
          totals[1] += currentValue - nextValue;
        current = next;
        next++;
      }
    }

    // Up/Down
    for (let y = 0; y < 4; y++) {
      let current = 0;
      let next = current + 1;
      while (next < 4) {
        while (next < 4 && !this.cellOccupied({ x: next, y })) next++;
        if (next >= 4) next--;
        const currentValue = this.cellOccupied({ x: current, y })
          ? Math.log(this.cellContent({ x: current, y }).value) / Math.log(2)
          : 0;
        const nextValue = this.cellOccupied({ x: next, y })
          ? Math.log(this.cellContent({ x: next, y }).value) / Math.log(2)
          : 0;
        if (currentValue > nextValue) totals[2] += nextValue - currentValue;
        else if (nextValue > currentValue)
          totals[3] += currentValue - nextValue;
        current = next;
        next++;
      }
    }

    return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
  }

  islands() {
    // Simplified island check for performance
    return 0;
  }

  maxValue() {
    let max = 0;
    this.eachCell((x, y, tile) => {
      if (tile && tile.value > max) max = tile.value;
    });
    return Math.log(max) / Math.log(2);
  }
}

class AI {
  constructor(grid) {
    this.grid = grid;
  }

  eval() {
    const emptyCells = this.grid.availableCells().length;
    const smoothWeight = 0.1;
    const mono2Weight = 1.0;
    const emptyWeight = 2.7;
    const maxWeight = 1.0;

    return (
      this.grid.smoothness() * smoothWeight +
      this.grid.monotonicity2() * mono2Weight +
      Math.log(emptyCells) * emptyWeight +
      this.grid.maxValue() * maxWeight
    );
  }

  search(depth, alpha, beta, positions, cutoffs) {
    let bestScore;
    let bestMove = -1;
    let result;

    if (this.grid.playerTurn) {
      bestScore = alpha;
      for (let direction = 0; direction < 4; direction++) {
        const newGrid = this.grid.clone();
        if (newGrid.move(direction).moved) {
          positions++;
          if (newGrid.cellsAvailable() === 0 && !newGrid.movesAvailable()) {
            // Losing state, low score
            return { move: direction, score: -10000, positions, cutoffs };
          }

          const newAI = new AI(newGrid);
          newGrid.playerTurn = false;

          if (depth === 0) {
            result = { move: direction, score: newAI.eval() };
          } else {
            result = newAI.search(
              depth - 1,
              bestScore,
              beta,
              positions,
              cutoffs,
            );
          }

          if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = direction;
          }
          if (bestScore > beta) {
            cutoffs++;
            return { move: bestMove, score: beta, positions, cutoffs };
          }
        }
      }
    } else {
      bestScore = beta;
      const candidates = [];
      const cells = this.grid.availableCells();
      const scores = { 2: [], 4: [] };

      // Pruning: Check annoying moves
      // Simplified for JS performance in React thread
      const possibleValues = [2, 4];

      for (let value of possibleValues) {
        for (let i = 0; i < cells.length; i++) {
          candidates.push({ position: cells[i], value: value });
        }
      }

      // Limit candidates for performance in JS thread
      const limitedCandidates = candidates.slice(
        0,
        Math.max(4, candidates.length),
      );

      for (let i = 0; i < limitedCandidates.length; i++) {
        const position = limitedCandidates[i].position;
        const value = limitedCandidates[i].value;
        const newGrid = this.grid.clone();
        const tile = new Tile(position, value);
        newGrid.insertTile(tile);
        newGrid.playerTurn = true;
        positions++;

        const newAI = new AI(newGrid);
        result = newAI.search(depth, alpha, bestScore, positions, cutoffs);

        if (result.score < bestScore) {
          bestScore = result.score;
        }
        if (bestScore < alpha) {
          cutoffs++;
          return { move: null, score: alpha, positions, cutoffs };
        }
      }
    }

    return { move: bestMove, score: bestScore, positions, cutoffs };
  }

  getBest() {
    return this.iterativeDeep();
  }

  iterativeDeep() {
    const start = new Date().getTime();
    let depth = 0;
    let best = { move: -1 };

    // Safety break to prevent freezing UI
    do {
      const newBest = this.search(depth, -10000, 10000, 0, 0);
      if (newBest.move === -1) break;
      best = newBest;
      depth++;
    } while (new Date().getTime() - start < 100 && depth < 4); // 100ms max

    return best;
  }
}

// ==========================================
// REACT COMPONENT
// ==========================================

const Game2048 = () => {
  // State
  const [grid, setGrid] = useState(new Grid(4));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("2048-best-ai")) || 0,
  );
  const [status, setStatus] = useState("playing"); // playing, won, over
  const [aiActive, setAiActive] = useState(false);
  const [hint, setHint] = useState(null);

  // Refs for loop management
  const gameRef = useRef({ grid: new Grid(4), score: 0, status: "playing" });
  const aiTimeoutRef = useRef(null);

  // Sync state to Ref (for AI loop access without stale closures)
  useEffect(() => {
    gameRef.current = { grid, score, status };
  }, [grid, score, status]);

  // --- Actions ---

  const initGame = useCallback(() => {
    const newGrid = new Grid(4);
    // Add start tiles
    newGrid.insertTile(new Tile(newGrid.randomAvailableCell(), 2));
    newGrid.insertTile(new Tile(newGrid.randomAvailableCell(), 2));

    setGrid(newGrid);
    setScore(0);
    setStatus("playing");
    setAiActive(false);
    setHint(null);
  }, []);

  const move = useCallback(
    (direction) => {
      const currentGrid = gameRef.current.grid;
      if (gameRef.current.status !== "playing") return;

      // Clone to prevent direct mutation of state
      const gridClone = currentGrid.clone();
      const result = gridClone.move(direction);

      if (result.moved) {
        // Computer Move (Random Tile)
        const tileValue = Math.random() < 0.9 ? 2 : 4;
        const available = gridClone.availableCells();
        if (available.length > 0) {
          const randomCell =
            available[Math.floor(Math.random() * available.length)];
          gridClone.insertTile(new Tile(randomCell, tileValue));
        }

        // Update State
        const newScore = gameRef.current.score + result.score;
        setScore(newScore);
        setGrid(gridClone);

        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("2048-best-ai", newScore);
        }

        if (result.won) {
          setStatus("won");
          setAiActive(false);
        } else if (!gridClone.movesAvailable()) {
          setStatus("over");
          setAiActive(false);
        }
      }
    },
    [bestScore],
  );

  // --- AI Loop ---

  useEffect(() => {
    if (aiActive && status === "playing") {
      const runAI = () => {
        const currentGrid = gameRef.current.grid;
        // The AI operates on the Grid class we defined above
        const ai = new AI(currentGrid);

        // Use a slight timeout to allow UI to render frames
        aiTimeoutRef.current = setTimeout(() => {
          const best = ai.getBest();
          if (best.move !== -1) {
            move(best.move);
          } else {
            // No valid moves found by AI, might be game over or bug
            setAiActive(false);
          }
        }, 100); // Speed of AI
      };

      runAI();
    }
    return () => clearTimeout(aiTimeoutRef.current);
  }, [aiActive, score, status, move]); // Re-run when score/grid updates

  // --- Input ---

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (aiActive) return;
      const map = {
        ArrowUp: 0,
        ArrowRight: 1,
        ArrowDown: 2,
        ArrowLeft: 3,
        w: 0,
        d: 1,
        s: 2,
        a: 3,
      };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, aiActive]);

  // --- Hint System ---
  const getHint = () => {
    const ai = new AI(gameRef.current.grid);
    const best = ai.getBest();
    const dirs = ["Up", "Right", "Down", "Left"];
    setHint(dirs[best.move]);
    setTimeout(() => setHint(null), 2000);
  };

  // --- Styling Helper ---
  const getTileStyle = (value, x, y) => {
    // Calculate position manually for the "slide" effect (simplified for React)
    // In a full implementation, we'd use transform translate based on x/y
    // Here we use absolute positioning percentages

    const colors = {
      2: "bg-emerald-400 text-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.3)]",
      4: "bg-teal-400 text-slate-900 shadow-[0_0_10px_rgba(45,212,191,0.3)]",
      8: "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]",
      16: "bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]",
      32: "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]",
      64: "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]",
      128: "bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] border border-violet-400",
      256: "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)] border border-purple-400",
      512: "bg-fuchsia-600 text-white shadow-[0_0_25px_rgba(192,38,211,0.7)] border border-fuchsia-400",
      1024: "bg-pink-600 text-white shadow-[0_0_25px_rgba(219,39,119,0.7)] border border-pink-400",
      2048: "bg-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.9)] border-2 border-white animate-pulse",
    };

    const baseClass =
      "absolute flex items-center justify-center font-bold rounded-lg transition-all duration-100 z-10";
    // Grid is 4x4.
    // Left: x * 25%
    // Top: y * 25%
    // Width/Height: approx 23% to allow gaps

    return {
      className: `${baseClass} ${colors[value] || "bg-slate-700 text-white"}`,
      style: {
        width: "calc(25% - 12px)",
        height: "calc(25% - 12px)",
        left: `calc(${x * 25}% + 6px)`,
        top: `calc(${y * 25}% + 6px)`,
        fontSize: value > 512 ? "22px" : "32px",
        zIndex: value,
      },
    };
  };

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Flatten grid for rendering
  const tilesToRender = [];
  if (grid && grid.cells) {
    grid.eachCell((x, y, tile) => {
      if (tile)
        tilesToRender.push({
          ...tile,
          key: `tile-${tile.id || Math.random()}-${x}-${y}`,
        });
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-100">
      <div className="w-[500px] max-w-[95vw]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              to="/"
              className="text-slate-400 font-bold text-sm flex items-center gap-1 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              2048
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Join the numbers to get to{" "}
              <span className="font-bold text-rose-500">2048!</span>
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl min-w-[80px] text-center shadow-lg">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Score
              </div>
              <div className="text-cyan-400 text-xl font-bold">{score}</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl min-w-[80px] text-center shadow-lg">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Best
              </div>
              <div className="text-purple-400 text-xl font-bold">
                {bestScore}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={initGame}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <RotateCcw size={18} /> Restart
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-xl p-[6px] w-full aspect-square touch-none shadow-2xl">
          {/* Status Overlay */}
          {status !== "playing" && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 rounded-xl animate-in fade-in backdrop-blur-sm">
              <Trophy
                size={64}
                className={
                  status === "won"
                    ? "text-yellow-400 mb-4"
                    : "text-slate-600 mb-4"
                }
              />
              <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">
                {status === "won" ? "VICTORY" : "GAME OVER"}
              </h2>
              <p className="text-slate-400 mb-6 font-bold">
                Final Score: <span className="text-cyan-400">{score}</span>
              </p>
              <button
                onClick={initGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Background Grid Cells */}
          <div className="grid grid-cols-4 grid-rows-4 gap-[12px] w-full h-full p-[6px]">
            {Array(16)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-700/50 rounded-lg w-full h-full border border-slate-700/50"
                ></div>
              ))}
          </div>

          {/* Actual Tiles */}
          <div className="absolute inset-0 p-[6px]">
            {tilesToRender.map((tile) => {
              const style = getTileStyle(tile.value, tile.x, tile.y);
              return (
                <div
                  key={tile.key}
                  className={style.className}
                  style={style.style}
                >
                  {tile.value}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm text-center">
          <p className="mb-2">
            <strong className="text-slate-300 uppercase tracking-wide">
              How to play:
            </strong>{" "}
            Use <strong>arrow keys</strong> to merge tiles.
          </p>
          <p>
            <strong className="text-slate-300 uppercase tracking-wide">
              AI:
            </strong>{" "}
            Powered by <strong>Expectimax Search</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
