import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RotateCcw,
  Trophy,
  BrainCircuit,
  Eraser,
  Pencil,
  Lightbulb,
  Play,
  Pause,
  Timer as TimerIcon,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Logic Engine (Preserved & Optimized) ---

const BLANK = 0;

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const isValid = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        board[startRow + i][startCol + j] === num &&
        (startRow + i !== row || startCol + j !== col)
      ) {
        return false;
      }
    }
  }
  return true;
};

const solveBoard = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateSudoku = (difficulty = "Medium") => {
  const newBoard = Array.from({ length: 9 }, () => Array(9).fill(BLANK));

  // Fill diagonal boxes
  for (let i = 0; i < 9; i = i + 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        newBoard[i + r][i + c] = nums[r * 3 + c];
      }
    }
  }

  solveBoard(newBoard);
  const solution = newBoard.map((row) => [...row]);

  // Remove numbers based on difficulty
  const attempts =
    difficulty === "Easy" ? 30 : difficulty === "Medium" ? 45 : 58;
  const puzzle = newBoard.map((row) => [...row]);

  for (let i = 0; i < attempts; i++) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (puzzle[row][col] === BLANK) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    puzzle[row][col] = BLANK;
  }

  return { initial: puzzle, solution };
};

// --- Format Timer Helper ---
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

// --- Main Component ---

const Sudoku = () => {
  // Game State
  const [board, setBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [notes, setNotes] = useState([]); // 9x9 grid of sets

  // UI State
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState("loading"); // loading, playing, won, lost
  const [noteMode, setNoteMode] = useState(false);

  // Refs
  const timerRef = useRef(null);

  // Initialize Game
  const newGame = useCallback(
    (diff = difficulty) => {
      const { initial, solution: solved } = generateSudoku(diff);

      setBoard(initial.map((row) => [...row]));
      setInitialBoard(initial.map((row) => [...row]));
      setSolution(solved);

      // Initialize empty notes grid
      const emptyNotes = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => new Set()),
      );
      setNotes(emptyNotes);

      setMistakes(0);
      setTimer(0);
      setGameState("playing");
      setIsPaused(false);
      setSelected(null);
      setDifficulty(diff);
    },
    [difficulty],
  );

  useEffect(() => {
    newGame();
  }, []); // Run once on mount

  // Timer Logic
  useEffect(() => {
    if (gameState === "playing" && !isPaused) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, isPaused]);

  // Input Handler
  const handleInput = (num) => {
    if (gameState !== "playing" || isPaused || !selected) return;
    const { r, c } = selected;

    // Cannot edit initial cells
    if (initialBoard[r][c] !== BLANK) return;

    // Mode: Eraser
    if (num === -1) {
      const newBoard = [...board];
      newBoard[r][c] = BLANK;
      setBoard(newBoard);

      const newNotes = [...notes];
      newNotes[r][c] = new Set();
      setNotes(newNotes);
      return;
    }

    // Mode: Notes
    if (noteMode) {
      const newNotes = [...notes];
      const cellNotes = new Set(newNotes[r][c]);
      if (cellNotes.has(num)) cellNotes.delete(num);
      else cellNotes.add(num);
      newNotes[r][c] = cellNotes;
      setNotes(newNotes);
      return;
    }

    // Mode: Normal Input
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Logic: Check Correctness
    if (num !== solution[r][c]) {
      setMistakes((m) => {
        const newMistakes = m + 1;
        if (newMistakes >= 3) setGameState("lost");
        return newMistakes;
      });
    } else {
      // Clear notes in this row/col/box if number is placed correctly
      // (Simplified: just clear notes in this specific cell for now)
      const newNotes = [...notes];
      newNotes[r][c] = new Set();
      setNotes(newNotes);

      // Check Win
      const isFull = newBoard.every((row) =>
        row.every((cell) => cell !== BLANK),
      );
      if (isFull) {
        const isCorrect = newBoard.every((row, ri) =>
          row.every((cell, ci) => cell === solution[ri][ci]),
        );
        if (isCorrect) setGameState("won");
      }
    }
  };

  const handleHint = () => {
    if (gameState !== "playing" || isPaused || !selected) return;
    const { r, c } = selected;
    if (board[r][c] !== BLANK) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];
    setBoard(newBoard);
    setTimer((t) => t + 30); // Penalty
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "playing" || isPaused) return;

      if (e.key >= "1" && e.key <= "9") handleInput(parseInt(e.key));
      if (e.key === "Backspace" || e.key === "Delete") handleInput(-1);
      if (e.key === "n") setNoteMode((prev) => !prev);

      if (!selected) return;
      const { r, c } = selected;
      if (e.key === "ArrowUp") setSelected({ r: Math.max(0, r - 1), c });
      if (e.key === "ArrowDown") setSelected({ r: Math.min(8, r + 1), c });
      if (e.key === "ArrowLeft") setSelected({ r, c: Math.max(0, c - 1) });
      if (e.key === "ArrowRight") setSelected({ r, c: Math.min(8, c + 1) });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, isPaused, selected, noteMode, board, notes]);

  // Helper: Get Cell Styles
  const getCellStyle = (r, c) => {
    const val = board[r][c];
    const isInitial = initialBoard[r][c] !== BLANK;
    const isSelected = selected?.r === r && selected?.c === c;
    const isError = val !== BLANK && val !== solution[r][c];

    // Highlight Logic
    const isRelated =
      selected &&
      (selected.r === r ||
        selected.c === c ||
        (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
          Math.floor(selected.c / 3) === Math.floor(c / 3)));
    const isSameNumber =
      selected &&
      board[selected.r][selected.c] !== BLANK &&
      val === board[selected.r][selected.c];

    // Borders (Thick for 3x3 blocks)
    let borderClass =
      "border-slate-200 dark:border-slate-700 border-r border-b";
    if ((c + 1) % 3 === 0 && c !== 8)
      borderClass += " border-r-2 border-r-slate-400 dark:border-r-slate-500";
    if ((r + 1) % 3 === 0 && r !== 8)
      borderClass += " border-b-2 border-b-slate-400 dark:border-b-slate-500";

    // Backgrounds
    let bgClass = "bg-white dark:bg-slate-800";
    if (isError)
      bgClass = "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400";
    else if (isSameNumber)
      bgClass = "bg-blue-200 dark:bg-blue-800"; // Highlight matching numbers
    else if (isSelected) bgClass = "bg-blue-500 text-white";
    else if (isRelated) bgClass = "bg-blue-50 dark:bg-slate-700";
    else if (isInitial) bgClass = "bg-slate-100 dark:bg-slate-900";

    // Text Colors
    let textClass = isInitial
      ? "text-slate-900 dark:text-slate-100 font-bold"
      : "text-blue-600 dark:text-blue-400 font-medium";
    if (isSelected) textClass = "text-white";
    if (isError) textClass = "text-red-600 dark:text-red-400";

    return `${borderClass} ${bgClass} ${textClass}`;
  };

  if (gameState === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
        Loading Game...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans select-none transition-colors duration-300">
      {/* --- Header --- */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Sudoku
          </h1>
          <div className="w-6"></div> {/* Spacer */}
        </div>

        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Mistakes
              </span>
              <span
                className={`font-mono font-bold ${mistakes > 0 ? "text-red-500" : "text-slate-700 dark:text-slate-200"}`}
              >
                {mistakes}/3
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Difficulty
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
              <TimerIcon size={16} className="text-slate-400" />
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {formatTime(timer)}
              </span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              {isPaused ? (
                <Play size={20} fill="currentColor" />
              ) : (
                <Pause size={20} fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Game Board --- */}
      <div className="relative">
        <div
          className={`grid grid-cols-9 border-4 border-slate-800 dark:border-slate-600 bg-slate-800 dark:bg-slate-600 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${isPaused ? "blur-sm opacity-50" : ""}`}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => setSelected({ r, c })}
                className={`
                        w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 
                        flex items-center justify-center relative
                        cursor-pointer text-xl sm:text-2xl transition-colors duration-75
                        ${getCellStyle(r, c)}
                    `}
              >
                {/* Main Number */}
                {cell !== BLANK ? cell : null}

                {/* Pencil Notes */}
                {cell === BLANK && notes[r][c].size > 0 && (
                  <div className="grid grid-cols-3 w-full h-full p-[2px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <div
                        key={n}
                        className="flex items-center justify-center text-[8px] sm:text-[10px] leading-none text-slate-500 dark:text-slate-400"
                      >
                        {notes[r][c].has(n) ? n : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )),
          )}
        </div>

        {/* Overlay: Paused / Game Over */}
        {(isPaused || gameState !== "playing") && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-lg animate-in fade-in zoom-in duration-300">
            {gameState === "won" && (
              <Trophy
                size={64}
                className="text-yellow-400 mb-4 animate-bounce"
              />
            )}
            {gameState === "lost" && (
              <BrainCircuit size={64} className="text-slate-500 mb-4" />
            )}

            <h2 className="text-4xl font-black text-white mb-2">
              {gameState === "won"
                ? "Solved!"
                : gameState === "lost"
                  ? "Game Over"
                  : "Paused"}
            </h2>

            {gameState === "playing" ? (
              <button
                onClick={() => setIsPaused(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold transition-all"
              >
                Resume Game
              </button>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => newGame(difficulty)}
                  className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:scale-105 transition-all"
                >
                  New Game
                </button>
                <div className="flex bg-slate-800 rounded-full p-1">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => newGame(d)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${d === difficulty ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Controls --- */}
      <div className="w-full max-w-lg mt-8">
        {/* Tools */}
        <div className="flex justify-between mb-4 gap-2">
          <button
            onClick={() => newGame(difficulty)}
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={20} />{" "}
            <span className="text-xs font-bold">New</span>
          </button>
          <button
            onClick={() => handleInput(-1)}
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Eraser size={20} />{" "}
            <span className="text-xs font-bold">Erase</span>
          </button>
          <button
            onClick={() => setNoteMode(!noteMode)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${noteMode ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
          >
            <Pencil size={20} />{" "}
            <span className="text-xs font-bold">Notes</span>
          </button>
          <button
            onClick={handleHint}
            className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Lightbulb size={20} />{" "}
            <span className="text-xs font-bold">Hint</span>
          </button>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="aspect-[4/5] bg-blue-100 dark:bg-slate-800 hover:bg-blue-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-xl sm:text-2xl font-bold transition-all shadow-sm active:scale-95 border-b-4 border-blue-200 dark:border-slate-900 active:border-b-0 active:translate-y-[4px]"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
