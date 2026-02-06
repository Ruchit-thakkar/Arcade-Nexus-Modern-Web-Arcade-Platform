import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Cpu, Users, Trophy } from "lucide-react";

// --- Constants ---
const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const PLAYER = "Red";
const AI = "Yellow";

// --- Pure Helper Functions (The Brains) ---

// 1. Check if column accepts moves
const isColumnValid = (board, colIndex) => {
  return board[colIndex] === EMPTY;
};

// 2. Find drop index
const getLowestEmptyIndex = (board, colIndex) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    const index = r * COLS + colIndex;
    if (board[index] === EMPTY) return index;
  }
  return null;
};

// 3. Check for Win (Returns winning indices or null)
const checkWin = (board, piece) => {
  // Horizontal, Vertical, Diagonal Right, Diagonal Left
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c;
      if (board[index] !== piece) continue;

      for (let [dr, dc] of directions) {
        let line = [index];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (
            nr < 0 ||
            nr >= ROWS ||
            nc < 0 ||
            nc >= COLS ||
            board[nr * COLS + nc] !== piece
          )
            break;
          line.push(nr * COLS + nc);
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
};

// --- NEW LOGIC: Heuristic Scoring System ---

const scoreWindow = (window, piece) => {
  let score = 0;
  const oppPiece = piece === AI ? PLAYER : AI;

  const countPiece = window.filter((c) => c === piece).length;
  const countEmpty = window.filter((c) => c === EMPTY).length;
  const countOpp = window.filter((c) => c === oppPiece).length;

  // AI Priorities
  if (countPiece === 4) return 1000; // Win immediately
  if (countPiece === 3 && countEmpty === 1) return 50; // Setup 3
  if (countPiece === 2 && countEmpty === 2) return 10; // Setup 2

  // Blocking Priorities (Heavily penalized if opponent has 3)
  if (countOpp === 3 && countEmpty === 1) return -80;

  return score;
};

const scoreBoard = (board, piece) => {
  let score = 0;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  // Score Center Column higher (Strategic advantage)
  const centerArray = [];
  for (let r = 0; r < ROWS; r++) {
    centerArray.push(board[r * COLS + 3]);
  }
  const centerCount = centerArray.filter((c) => c === piece).length;
  score += centerCount * 3;

  // Evaluate all 4-cell windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (let [dr, dc] of directions) {
        // Only check if window fits in board
        if (
          r + 3 * dr < ROWS &&
          r + 3 * dr >= 0 &&
          c + 3 * dc < COLS &&
          c + 3 * dc >= 0
        ) {
          const window = [];
          for (let i = 0; i < 4; i++) {
            window.push(board[(r + dr * i) * COLS + (c + dc * i)]);
          }
          score += scoreWindow(window, piece);
        }
      }
    }
  }
  return score;
};

const getBestMove = (board) => {
  const validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (isColumnValid(board, c)) validCols.push(c);
  }
  if (validCols.length === 0) return -1;

  // 1. Critical Check: Can we win NOW or must we block NOW?
  // This overrides the scoring system to ensure we don't miss obvious moves.
  for (let col of validCols) {
    let tempBoard = [...board];
    let row = getLowestEmptyIndex(tempBoard, col);
    tempBoard[row] = AI;
    if (checkWin(tempBoard, AI)) return col; // Take Win
  }
  for (let col of validCols) {
    let tempBoard = [...board];
    let row = getLowestEmptyIndex(tempBoard, col);
    tempBoard[row] = PLAYER;
    if (checkWin(tempBoard, PLAYER)) return col; // Block Win
  }

  // 2. Positional Scoring (Lookahead)
  // Simulate dropping a piece in every column and score the resulting board
  let bestScore = -Infinity;
  let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

  for (let col of validCols) {
    const tempBoard = [...board];
    const row = getLowestEmptyIndex(tempBoard, col);
    tempBoard[row] = AI;

    const score = scoreBoard(tempBoard, AI);

    // Add a tiny bit of randomness to break ties so it doesn't play identical games every time
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
};

const ConnectFour = () => {
  // --- State ---
  const [gameKey, setGameKey] = useState(0);
  const [board, setBoard] = useState(Array(ROWS * COLS).fill(null));
  const [isRedNext, setIsRedNext] = useState(true);
  const [gameMode, setGameMode] = useState("multi");
  const [gameState, setGameState] = useState({ winner: null, line: [] });
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Logic ---
  const handleMove = useCallback(
    (colIndex) => {
      // 1. Validation Locks
      if (gameState.winner || isAiThinking) return;
      if (gameMode === "single" && !isRedNext) return;

      // 2. Check Valid Column
      if (!isColumnValid(board, colIndex)) return;

      // 3. Execute Move
      executeMove(colIndex, isRedNext ? PLAYER : AI);
    },
    [board, gameState.winner, isAiThinking, isRedNext, gameMode],
  );

  const executeMove = (colIndex, player) => {
    const targetIndex = getLowestEmptyIndex(board, colIndex);
    if (targetIndex === null) return;

    const newBoard = [...board];
    newBoard[targetIndex] = player;
    setBoard(newBoard);

    // 4. Check Results
    const winLine = checkWin(newBoard, player);

    if (winLine) {
      setGameState({ winner: player, line: winLine });
    } else if (!newBoard.includes(null)) {
      setGameState({ winner: "draw", line: [] });
    } else {
      setIsRedNext((prev) => !prev);
    }
  };

  // --- AI Effect ---
  useEffect(() => {
    if (gameMode === "single" && !isRedNext && !gameState.winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiCol = getBestMove(board);
        if (aiCol !== -1) {
          executeMove(aiCol, AI);
        }
        setIsAiThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isRedNext, gameMode, gameState.winner]);

  // --- Controls ---
  const resetGame = () => {
    setGameKey((prev) => prev + 1);
    setBoard(Array(ROWS * COLS).fill(null));
    setIsRedNext(true);
    setGameState({ winner: null, line: [] });
    setIsAiThinking(false);
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  // --- Render ---
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black mb-2 flex justify-center gap-2">
          <span className="text-red-500">Connect</span>
          <span className="text-yellow-400">Four</span>
        </h1>
      </div>

      {/* Mode Switcher */}
      <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex gap-1">
        <button
          onClick={() => switchMode("single")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            gameMode === "single"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <Cpu size={16} /> Single Player
        </button>
        <button
          onClick={() => switchMode("multi")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            gameMode === "multi"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <Users size={16} /> Multi Player
        </button>
      </div>

      {/* Game Area */}
      <div key={gameKey} className="relative group">
        {/* Player Indicators */}
        <div className="flex justify-between px-4 mb-4 w-full max-w-[340px] mx-auto">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${isRedNext ? "border-red-500 bg-red-50 dark:bg-red-900/20 scale-105 shadow-md" : "border-transparent opacity-50"}`}
          >
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-bold text-sm">
              {gameMode === "single" ? "You" : "P1"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${!isRedNext ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-105 shadow-md" : "border-transparent opacity-50"}`}
          >
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="font-bold text-sm">
              {gameMode === "single" ? "AI" : "P2"}
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="bg-blue-600 p-3 sm:p-4 rounded-3xl shadow-2xl border-b-[10px] border-blue-800 relative">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {board.map((val, i) => {
              const colIndex = i % COLS;
              const isWin = gameState.line.includes(i);
              const canClick =
                !gameState.winner &&
                !isAiThinking &&
                (gameMode === "multi" || isRedNext);

              return (
                <div
                  key={i}
                  className="relative cursor-pointer"
                  onClick={() => canClick && handleMove(colIndex)}
                >
                  <div
                    className={`w-9 h-9 sm:w-14 sm:h-14 rounded-full border-4 shadow-inner flex items-center justify-center ${isWin ? "border-white bg-green-500 animate-pulse" : "border-blue-700 bg-blue-800"}`}
                  >
                    <div
                      className={`w-full h-full rounded-full transition-transform duration-500 ${val === "Red" ? "bg-red-500 scale-100" : ""} ${val === "Yellow" ? "bg-yellow-400 scale-100" : ""} ${!val ? "scale-0" : ""}`}
                    />
                  </div>
                  {canClick && !val && (
                    <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameState.winner && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-3xl animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl text-center border-4 border-white dark:border-gray-700 transform animate-in zoom-in-95">
              <Trophy
                className={`w-12 h-12 mx-auto mb-3 ${gameState.winner === "Red" ? "text-red-500" : "text-yellow-400"}`}
              />
              <h2 className="text-2xl font-black mb-4">
                {gameState.winner === "draw"
                  ? "Draw!"
                  : `${gameState.winner} Wins!`}
              </h2>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2 mx-auto"
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="mt-8 text-sm font-medium text-gray-400 h-6">
        {isAiThinking ? (
          <span className="animate-pulse flex items-center gap-2">
            <Cpu size={14} /> AI is calculating move...
          </span>
        ) : (
          !gameState.winner && (
            <span>
              {gameMode === "single" && isRedNext
                ? "Your Turn"
                : "Waiting for move..."}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default ConnectFour;
