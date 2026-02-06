import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Settings,
  Cpu,
  User,
  Trophy,
  History,
  Swords,
  ChevronRight,
} from "lucide-react";

// ==========================================
// 1. ASSETS & THEME
// ==========================================

const THEME = {
  board: {
    light: "#e2e8f0", // slate-200
    dark: "#475569", // slate-600
    selected: "#818cf8", // indigo-400
    lastMove: "rgba(129, 140, 248, 0.4)",
    possible: "rgba(0,0,0,0.15)",
    capture: "rgba(239, 68, 68, 0.4)", // red-500 ring
  },
  bg: "#0f172a", // slate-900
  panel: "#1e293b", // slate-800
  text: "#f8fafc", // slate-50
};

const Icons = {
  p: (c) => (
    <path
      fill={c}
      d="M22,9 C19.792,9 18,10.792 18,13 C18,13.885 18.2939,14.7125 18.78125,15.375 C16.83125,16.4975 15.5,18.59 15.5,21 C15.5,23.03 16.445,24.84 17.9375,26.03125 C14.9125,27.09125 10.5,31.585 10.5,39.5 L33.5,39.5 C33.5,31.585 29.0875,27.09125 26.0625,26.03125 C27.555,24.84 28.5,23.03 28.5,21 C28.5,18.59 27.16875,16.4975 25.21875,15.375 C25.7061,14.7125 26,13.885 26,13 C26,10.792 24.208,9 22,9 z"
    />
  ),
  r: (c) => (
    <path
      fill={c}
      d="M9,39 L36,39 L36,36 L9,36 L9,39 z M12,36 L33,36 L33,32 L12,32 L12,36 z M11,14 L11,9 L15,9 L15,11 L20,11 L20,9 L25,9 L25,11 L30,11 L30,9 L34,9 L34,14 C34,14 34,16 34,16 L11,16 C11,16 11,14 11,14 z M12,32 L33,32 L33,29 L12,29 L12,32 z M14,29 L31,29 L31,16 L14,16 L14,29 z"
    />
  ),
  n: (c) => (
    <path
      fill={c}
      d="M22,10 C32.5,11 38.5,25 38,39 L7,39 C7,39 6,24 25,24 C19,20 18,22 17,25 C17,25 10,24 15,14 C15,14 18,7 22,10 z"
    />
  ),
  b: (c) => (
    <g>
      <path
        fill={c}
        d="M22,9 C19.792,9 18,10.792 18,13 C18,13.885 18.2939,14.7125 18.78125,15.375 C16.83125,16.4975 15.5,18.59 15.5,21 C15.5,23.03 16.445,24.84 17.9375,26.03125 C14.9125,27.09125 10.5,31.585 10.5,39.5 L33.5,39.5 C33.5,31.585 29.0875,27.09125 26.0625,26.03125 C27.555,24.84 28.5,23.03 28.5,21 C28.5,18.59 27.16875,16.4975 25.21875,15.375 C25.7061,14.7125 26,13.885 26,13 C26,10.792 24.208,9 22,9 z M9,26 C9,26 9,28 9,28 L36,28 C36,28 36,26 36,26 L9,26 z"
      />
      <path
        fill="none"
        stroke={c === "#fff" ? "#000" : "#fff"}
        strokeWidth="1.5"
        d="M22,10 C22,10 22,14 22,14"
      />
    </g>
  ),
  q: (c) => (
    <g>
      <path
        fill={c}
        d="M8,12 C11.5,12 11.5,15 11.5,15 L11.5,15 L14.5,15 L14.5,15 L14.5,12 C14.5,12 17.5,12 17.5,12 L17.5,12 L17.5,15 L17.5,15 L20.5,15 L20.5,15 L20.5,12 C20.5,12 23.5,12 23.5,12 L23.5,12 L23.5,15 L23.5,15 L26.5,15 L26.5,15 L26.5,12 C26.5,12 29.5,12 29.5,12 L29.5,12 L29.5,15 L29.5,15 L32.5,15 L32.5,15 L32.5,12 C32.5,12 36,12 36,12 C36,12 36,17 36,17 L36,17 L32,36 L32,36 L32,39 L32,39 L12,39 L12,39 L12,36 L12,36 L8,17 L8,17 C8,17 8,12 8,12 z"
      />
      <path
        fill="none"
        stroke={c === "#fff" ? "#000" : "#fff"}
        strokeWidth="1.5"
        d="M12,36 L32,36"
      />
    </g>
  ),
  k: (c) => (
    <path
      fill={c}
      d="M22,10 C22,10 22,6 22,6 L22,6 L22,10 L22,10 Z M22,10 C22,10 26,10 26,10 L26,10 L26,14 L26,14 L22,14 L22,14 L22,18 L22,18 L22,14 L22,14 L18,14 L18,14 L18,10 L18,10 L22,10 L22,10 Z M11.5,18 C11.5,18 10.5,23 10.5,23 L33.5,23 C33.5,23 32.5,18 32.5,18 L11.5,18 Z M11.5,24 C11.5,24 10.5,29 10.5,29 L33.5,29 C33.5,29 32.5,24 32.5,24 L11.5,24 Z M11.5,30 C11.5,30 11.5,33 11.5,33 L32.5,33 C32.5,33 32.5,30 32.5,30 L11.5,30 Z M11.5,34 C11.5,34 10.5,39 10.5,39 L33.5,39 C33.5,39 32.5,34 32.5,34 L11.5,34 Z"
    />
  ),
};

const Piece = ({ type, color }) => (
  <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
    <g
      stroke={color === "w" ? "#000" : "#fff"}
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      {Icons[type](color === "w" ? "#fff" : "#000")}
    </g>
  </svg>
);

// ==========================================
// 2. CHESS ENGINE (Logic & AI)
// ==========================================

const INITIAL_BOARD = [
  ["r", "n", "b", "q", "k", "b", "n", "r"], // 0 (Black)
  ["p", "p", "p", "p", "p", "p", "p", "p"], // 1
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  ["P", "P", "P", "P", "P", "P", "P", "P"], // 6
  ["R", "N", "B", "Q", "K", "B", "N", "R"], // 7 (White)
];

const getPieceColor = (p) => (p ? (p === p.toUpperCase() ? "w" : "b") : null);

// --- Evaluation Tables (PST) ---
const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
};

const isValidMove = (board, from, to, lastMove) => {
  const piece = board[from.r][from.c];
  const target = board[to.r][to.c];
  const color = getPieceColor(piece);
  if (getPieceColor(target) === color) return false;

  const dy = to.r - from.r;
  const dx = to.c - from.c;
  const absDy = Math.abs(dy);
  const absDx = Math.abs(dx);
  const type = piece.toLowerCase();

  switch (type) {
    case "p": {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      // Move 1
      if (dx === 0 && dy === dir && !target) return true;
      // Move 2
      if (
        dx === 0 &&
        dy === dir * 2 &&
        from.r === startRow &&
        !target &&
        !board[from.r + dir][from.c]
      )
        return true;
      // Capture
      if (absDx === 1 && dy === dir && target) return true;
      // En Passant
      if (absDx === 1 && dy === dir && !target && lastMove) {
        if (
          lastMove.piece.toLowerCase() === "p" &&
          Math.abs(lastMove.from.r - lastMove.to.r) === 2 &&
          lastMove.to.r === from.r &&
          lastMove.to.c === to.c
        )
          return true;
      }
      return false;
    }
    case "r":
      return (dx === 0 || dy === 0) && isPathClear(board, from, to);
    case "b":
      return absDx === absDy && isPathClear(board, from, to);
    case "q":
      return (
        (dx === 0 || dy === 0 || absDx === absDy) &&
        isPathClear(board, from, to)
      );
    case "n":
      return (absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1);
    case "k":
      return absDx <= 1 && absDy <= 1;
    default:
      return false;
  }
};

const isPathClear = (board, from, to) => {
  const dr = Math.sign(to.r - from.r);
  const dc = Math.sign(to.c - from.c);
  let r = from.r + dr,
    c = from.c + dc;
  while (r !== to.r || c !== to.c) {
    if (board[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
};

// --- Checkmate & AI Utilities ---
const findKing = (board, color) => {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (
        board[r][c] &&
        board[r][c].toLowerCase() === "k" &&
        getPieceColor(board[r][c]) === color
      )
        return { r, c };
  return null;
};

const isKingInCheck = (board, color) => {
  const k = findKing(board, color);
  if (!k) return true;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (
        p &&
        getPieceColor(p) !== color &&
        isValidMove(board, { r, c }, k, null)
      )
        return true;
    }
  return false;
};

const getAllMoves = (board, color, lastMove) => {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (getPieceColor(board[r][c]) === color) {
        for (let tr = 0; tr < 8; tr++)
          for (let tc = 0; tc < 8; tc++) {
            const from = { r, c },
              to = { r: tr, c: tc };
            if (isValidMove(board, from, to, lastMove)) {
              const temp = board.map((row) => [...row]);
              temp[to.r][to.c] = temp[from.r][from.c];
              temp[from.r][from.c] = null;
              if (!isKingInCheck(temp, color)) moves.push({ from, to });
            }
          }
      }
    }
  return moves;
};

// --- Evaluation & Minimax ---
const PIECE_VALS = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const evaluateBoard = (board) => {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const type = p.toLowerCase();
      const color = getPieceColor(p);
      let val = PIECE_VALS[type];

      // Position Bonus
      if (type === "p" || type === "n") {
        const table = PST[type];
        const row = color === "b" ? r : 7 - r;
        val += table[row][c];
      }

      score += color === "w" ? val : -val;
    }
  return score;
};

const minimax = (board, depth, isMax, alpha, beta, lastMove) => {
  if (depth === 0) return evaluateBoard(board);

  const turn = isMax ? "w" : "b";
  const moves = getAllMoves(board, turn, lastMove);

  if (moves.length === 0)
    return isKingInCheck(board, turn) ? (isMax ? -100000 : 100000) : 0;

  if (isMax) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const copy = board.map((r) => [...r]);
      copy[move.to.r][move.to.c] = copy[move.from.r][move.from.c];
      copy[move.from.r][move.from.c] = null;
      const ev = minimax(copy, depth - 1, false, alpha, beta, lastMove);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const copy = board.map((r) => [...r]);
      copy[move.to.r][move.to.c] = copy[move.from.r][move.from.c];
      copy[move.from.r][move.from.c] = null;
      const ev = minimax(copy, depth - 1, true, alpha, beta, lastMove);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const getBestMove = (board, lastMove, difficulty, aiColor) => {
  const depth = difficulty === "hard" ? 3 : 2;
  const moves = getAllMoves(board, aiColor, lastMove);
  if (moves.length === 0) return null;

  if (difficulty === "easy" && Math.random() > 0.5)
    return moves[Math.floor(Math.random() * moves.length)];

  let bestMove = null;
  // If AI is White (aiColor='w'), it wants to Maximize. Start at -Infinity.
  // If AI is Black (aiColor='b'), it wants to Minimize. Start at Infinity.
  const isMaximizing = aiColor === "w";
  let bestVal = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const copy = board.map((r) => [...r]);
    copy[move.to.r][move.to.c] = copy[move.from.r][move.from.c];
    copy[move.from.r][move.from.c] = null;

    // Pass !isMaximizing because the next turn belongs to the opponent
    const val = minimax(
      copy,
      depth - 1,
      !isMaximizing,
      -Infinity,
      Infinity,
      lastMove,
    );

    if (isMaximizing) {
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
  }
  return bestMove;
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const ChessGame = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [turn, setTurn] = useState("w");
  const [selected, setSelected] = useState(null);
  const [possible, setPossible] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("single");
  const [difficulty, setDifficulty] = useState("medium");
  const [playerSide, setPlayerSide] = useState("w"); // 'w' or 'b'
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const historyRef = useRef(null);

  // Auto-scroll history
  useEffect(() => {
    if (historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  // AI Turn Logic
  useEffect(() => {
    // Run AI if Single Player AND it's NOT the player's turn
    if (mode === "single" && turn !== playerSide && !winner) {
      setThinking(true);
      setTimeout(() => {
        // AI plays the color equal to 'turn'
        const move = getBestMove(board, lastMove, difficulty, turn);
        if (move) executeMove(move.from, move.to);
        else checkForMate(turn);
        setThinking(false);
      }, 100);
    }
  }, [turn, mode, winner, playerSide]);

  const getPosNotation = (r, c) => `${String.fromCharCode(97 + c)}${8 - r}`;

  const checkForMate = (currentTurn) => {
    if (isKingInCheck(board, currentTurn))
      setWinner(currentTurn === "w" ? "Black Wins" : "White Wins");
    else setWinner("Draw (Stalemate)");
  };

  const handleSquareClick = (r, c) => {
    // Prevent interaction if game over OR it's AI's turn
    if (winner || (mode === "single" && turn !== playerSide)) return;

    // Move
    const targetStr = `${r},${c}`;
    if (possible.includes(targetStr)) {
      executeMove(selected, { r, c });
      return;
    }

    // Select
    const piece = board[r][c];
    if (piece && getPieceColor(piece) === turn) {
      setSelected({ r, c });
      const moves = getAllMoves(board, turn, lastMove)
        .filter((m) => m.from.r === r && m.from.c === c)
        .map((m) => `${m.to.r},${m.to.c}`);
      setPossible(moves);
    } else {
      setSelected(null);
      setPossible([]);
    }
  };

  const executeMove = (from, to) => {
    const newBoard = board.map((row) => [...row]);
    const piece = newBoard[from.r][from.c];

    // Update Board
    newBoard[to.r][to.c] = piece;
    newBoard[from.r][from.c] = null;

    // Promotion
    if (piece.toLowerCase() === "p" && (to.r === 0 || to.r === 7)) {
      newBoard[to.r][to.c] = turn === "w" ? "Q" : "q";
    }

    // History Log
    const notation = `${piece.toUpperCase() === "P" ? "" : piece.toUpperCase()}${getPosNotation(to.r, to.c)}`;
    setHistory((prev) => [...prev, { color: turn, text: notation }]);

    // Update State
    setBoard(newBoard);
    const moveData = { from, to, piece };
    setLastMove(moveData);
    setSelected(null);
    setPossible([]);

    // Next Turn
    const nextTurn = turn === "w" ? "b" : "w";
    if (getAllMoves(newBoard, nextTurn, moveData).length === 0) {
      if (isKingInCheck(newBoard, nextTurn))
        setWinner(turn === "w" ? "White Wins!" : "Black Wins!");
      else setWinner("Draw");
    } else {
      setTurn(nextTurn);
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn("w");
    setWinner(null);
    setHistory([]);
    setLastMove(null);
    setSelected(null);
    setPossible([]);
  };

  // --- Board Orientation Logic ---
  // If playing as Black, we reverse rows and cols for rendering
  const displayRows =
    playerSide === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const displayCols =
    playerSide === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col xl:flex-row items-center justify-center p-4 gap-8 font-sans">
      {/* --- LEFT PANEL (Settings & History) --- */}
      <div className="w-full max-w-[400px] flex flex-col gap-4 h-[600px]">
        {/* Header */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
          <h1 className="text-3xl font-black tracking-tighter italic flex items-center gap-3 mb-2">
            <Swords className="text-indigo-400" size={32} /> CHESS
            <span className="text-indigo-500">PRO</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            {mode === "single" ? <Cpu size={16} /> : <User size={16} />}
            <span>
              {mode === "single"
                ? `Vs Computer (${difficulty})`
                : "Pass & Play"}
            </span>
          </div>
        </div>

        {/* History Log */}
        <div className="flex-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
            <History size={18} className="text-indigo-400" />
            <span className="font-bold text-sm uppercase tracking-wider text-slate-400">
              Move History
            </span>
          </div>
          <div
            ref={historyRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600"
          >
            {history
              .reduce((result, move, index) => {
                if (index % 2 === 0) result.push([move]);
                else result[result.length - 1].push(move);
                return result;
              }, [])
              .map((pair, i) => (
                <div key={i} className="flex text-sm">
                  <span className="w-8 text-slate-500 font-mono text-center py-1">
                    {i + 1}.
                  </span>
                  <span className="flex-1 bg-slate-700/50 rounded px-2 py-1 mr-1 text-slate-200">
                    {pair[0].text}
                  </span>
                  {pair[1] && (
                    <span className="flex-1 bg-slate-700/50 rounded px-2 py-1 text-slate-200">
                      {pair[1].text}
                    </span>
                  )}
                </div>
              ))}
            {history.length === 0 && (
              <div className="text-center text-slate-600 italic mt-10">
                Game started...
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                resetGame();
              }}
            >
              <option value="single">Vs Computer</option>
              <option value="multi">Pass & Play</option>
            </select>

            {mode === "single" && (
              <select
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            )}
          </div>

          {/* Side Selection */}
          {mode === "single" && (
            <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => {
                  setPlayerSide("w");
                  resetGame();
                }}
                className={`flex-1 py-1 text-sm font-bold rounded ${playerSide === "w" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                Play White
              </button>
              <button
                onClick={() => {
                  setPlayerSide("b");
                  resetGame();
                }}
                className={`flex-1 py-1 text-sm font-bold rounded ${playerSide === "b" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                Play Black
              </button>
            </div>
          )}

          <button
            onClick={resetGame}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-600"
          >
            <RotateCcw size={18} /> Reset Game
          </button>
        </div>
      </div>

      {/* --- RIGHT PANEL (Board) --- */}
      <div className="relative">
        {/* Status Bar */}
        <div className="flex justify-between items-end mb-4 px-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${turn === "b" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-800 text-slate-500"}`}
          >
            <span className="font-bold">Black</span>
            {mode === "single" && playerSide === "w" && (
              <Cpu size={18} className="ml-1" />
            )}
            {thinking && turn === "b" && (
              <span className="text-xs animate-pulse ml-2">Thinking...</span>
            )}
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${turn === "w" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-800 text-slate-500"}`}
          >
            {mode === "single" && playerSide === "b" && (
              <Cpu size={18} className="mr-1" />
            )}
            <span className="font-bold">White</span>
            {thinking && turn === "w" && (
              <span className="text-xs animate-pulse ml-2">Thinking...</span>
            )}
          </div>
        </div>

        {/* Board Container */}
        <div className="bg-slate-800 p-3 rounded-xl shadow-2xl border border-slate-700 relative">
          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg animate-in fade-in">
              <Trophy
                size={64}
                className="text-yellow-400 mb-4 animate-bounce"
              />
              <h2 className="text-4xl font-black text-white mb-2">{winner}</h2>
              <button
                onClick={resetGame}
                className="mt-4 px-6 py-2 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform"
              >
                Play Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-8 grid-rows-8 w-[90vw] h-[90vw] max-w-[500px] max-h-[500px] border-2 border-slate-700 rounded-lg overflow-hidden">
            {/* RENDER LOOP using Display Rows/Cols to flip board */}
            {displayRows.map((r) =>
              displayCols.map((c) => {
                const piece = board[r][c];
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;
                const isLast =
                  lastMove &&
                  ((lastMove.from.r === r && lastMove.from.c === c) ||
                    (lastMove.to.r === r && lastMove.to.c === c));
                const isPossible = possible.includes(`${r},${c}`);
                const inCheck =
                  piece?.toLowerCase() === "k" &&
                  isKingInCheck(board, getPieceColor(piece));

                let bg = isDark ? THEME.board.dark : THEME.board.light;
                if (isSelected) bg = THEME.board.selected;
                else if (inCheck) bg = THEME.board.capture;
                else if (isLast) bg = THEME.board.lastMove;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className="relative flex items-center justify-center cursor-pointer select-none"
                    style={{ backgroundColor: bg }}
                  >
                    {/* Coordinates - Logic flips based on playerSide */}
                    {c === (playerSide === "w" ? 0 : 7) && (
                      <span
                        className={`absolute top-0.5 left-1 text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {8 - r}
                      </span>
                    )}
                    {r === (playerSide === "w" ? 7 : 0) && (
                      <span
                        className={`absolute bottom-0 right-1 text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {String.fromCharCode(97 + c)}
                      </span>
                    )}

                    {/* Possible Move Indicators */}
                    {isPossible && !piece && (
                      <div className="w-3 h-3 rounded-full bg-slate-900/20"></div>
                    )}
                    {isPossible && piece && (
                      <div className="absolute inset-0 border-[4px] border-slate-900/20 rounded-full"></div>
                    )}

                    {/* Piece */}
                    {piece && (
                      <div className="w-[85%] h-[85%] transition-transform duration-100 hover:scale-105">
                        <Piece
                          type={piece.toLowerCase()}
                          color={getPieceColor(piece)}
                        />
                      </div>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
