import React, { useState, useEffect } from "react";
import { X, Circle, RotateCcw, Cpu, Users } from "lucide-react";

const TicTacToe = () => {
  // --- State Management ---
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState("multi"); // 'single' or 'multi'
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  // --- Game Logic ---
  useEffect(() => {
    const calculateWinner = (squares) => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // Rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // Columns
        [0, 4, 8],
        [2, 4, 6], // Diagonals
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          return { winner: squares[a], line: lines[i] };
        }
      }
      return null;
    };

    const result = calculateWinner(board);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
    } else if (!board.includes(null)) {
      setWinner("draw");
    }
  }, [board]);

  // AI Turn Handling
  useEffect(() => {
    if (gameMode === "single" && !isXNext && !winner) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 500); // Artificial delay for realism
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, winner, board]);

  const makeAiMove = () => {
    const availableMoves = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);

    if (availableMoves.length === 0) return;

    // Simple AI Strategy:
    // 1. Check if AI can win immediately
    // 2. Check if Player is about to win (block them)
    // 3. Take center if available
    // 4. Random move

    const findWinningMove = (player) => {
      for (let i of availableMoves) {
        const tempBoard = [...board];
        tempBoard[i] = player;
        if (checkWinHelper(tempBoard, player)) return i;
      }
      return -1;
    };

    const checkWinHelper = (squares, player) => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      return lines.some(
        ([a, b, c]) =>
          squares[a] === player &&
          squares[b] === player &&
          squares[c] === player,
      );
    };

    let move = findWinningMove("O"); // Try to win
    if (move === -1) move = findWinningMove("X"); // Block player
    if (move === -1 && board[4] === null) move = 4; // Take center
    if (move === -1)
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random

    handleMove(move);
  };

  const handleMove = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const renderSquare = (i) => {
    const isWinningSquare = winningLine.includes(i);
    const val = board[i];
    // Allow click if: It's multiplayer OR it's single player and it's the Human's (X) turn
    const isTurn = gameMode === "multi" || (gameMode === "single" && isXNext);

    return (
      <button
        className={`
          h-20 w-20 sm:h-24 sm:w-24 rounded-xl shadow-sm border-2 
          flex items-center justify-center text-4xl transition-all duration-200
          ${
            isWinningSquare
              ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
              : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
          }
          ${
            !val && !winner && isTurn
              ? "hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:border-blue-500"
              : ""
          }
          ${!isTurn && !val ? "cursor-default" : ""}
        `}
        onClick={() => isTurn && handleMove(i)}
        disabled={
          val !== null || winner !== null || (gameMode === "single" && !isXNext)
        }
      >
        <div
          className={`transform transition-transform duration-300 ${val ? "scale-100" : "scale-0"}`}
        >
          {val === "X" && (
            <X
              className="w-12 h-12 text-blue-500 dark:text-blue-400"
              strokeWidth={2.5}
            />
          )}
          {val === "O" && (
            <Circle
              className="w-10 h-10 text-rose-500 dark:text-rose-400"
              strokeWidth={3}
            />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-blue-500 dark:text-blue-400">Tic</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-rose-500 dark:text-rose-400">Tac</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="dark:text-white">Toe</span>
        </h1>
      </div>

      {/* Mode Switcher */}
      <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex gap-1 transition-colors">
        <button
          onClick={() => switchMode("single")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            gameMode === "single"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Cpu size={16} /> Single Player
        </button>
        <button
          onClick={() => switchMode("multi")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            gameMode === "multi"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Users size={16} /> Multi Player
        </button>
      </div>

      {/* Game Board Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        {/* Player Indicators */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isXNext && !winner
                ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-100 dark:ring-blue-800"
                : "opacity-50"
            }`}
          >
            <X size={18} className="text-blue-500 dark:text-blue-400" />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
              {gameMode === "single" ? "You" : "P1"}
            </span>
          </div>

          <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
            VS
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              !isXNext && !winner
                ? "bg-rose-50 dark:bg-rose-900/30 ring-2 ring-rose-100 dark:ring-rose-800"
                : "opacity-50"
            }`}
          >
            <Circle size={16} className="text-rose-500 dark:text-rose-400" />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
              {gameMode === "single" ? "AI" : "P2"}
            </span>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {board.map((_, i) => (
            <React.Fragment key={i}>{renderSquare(i)}</React.Fragment>
          ))}
        </div>

        {/* Status / Reset Button */}
        <div className="mt-8 h-12">
          {winner ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={resetGame}
                className="w-full py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                <RotateCcw size={18} />
                {winner === "draw"
                  ? "It's a Draw! Play Again?"
                  : `${winner === "X" ? "Player X" : "Player O"} Wins! Play Again`}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-3 flex items-center justify-center gap-2">
              {gameMode === "single" && !isXNext ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  AI is thinking...
                </>
              ) : (
                "Make your move"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
