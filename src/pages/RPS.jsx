import React, { useState } from "react";
import { RotateCcw, Cpu, Trophy, Hand, Scissors, Scroll } from "lucide-react";

// Game Constants
const CHOICES = [
  { id: "rock", label: "Rock", icon: "🪨", beats: "scissors" },
  { id: "paper", label: "Paper", icon: "📄", beats: "rock" },
  { id: "scissors", label: "Scissors", icon: "✂️", beats: "paper" },
];

const RPS = () => {
  // --- State ---
  // Removed gameMode (Single Player only now)
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'result'
  const [p1Choice, setP1Choice] = useState(null);
  const [p2Choice, setP2Choice] = useState(null);
  const [result, setResult] = useState(null); // 'p1', 'p2', 'draw'
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [history, setHistory] = useState([]); // Track last few results

  // --- Logic ---

  // Handle a player making a choice
  const handleChoice = (choiceId) => {
    // Single Player: User picks, then AI picks immediately
    const userChoice = CHOICES.find((c) => c.id === choiceId);
    setP1Choice(userChoice);

    // AI Logic
    const randomIdx = Math.floor(Math.random() * 3);
    const aiChoice = CHOICES[randomIdx];
    setP2Choice(aiChoice);

    determineWinner(userChoice, aiChoice);
  };

  const determineWinner = (c1, c2) => {
    setGameState("result");

    let winner = "";
    if (c1.id === c2.id) {
      winner = "draw";
    } else if (c1.beats === c2.id) {
      winner = "p1";
      setScores((s) => ({ ...s, p1: s.p1 + 1 }));
    } else {
      winner = "p2";
      setScores((s) => ({ ...s, p2: s.p2 + 1 }));
    }

    setResult(winner);
    setHistory((prev) => [winner, ...prev].slice(0, 5));
  };

  const resetRound = () => {
    setP1Choice(null);
    setP2Choice(null);
    setResult(null);
    setGameState("idle");
  };

  // --- Render Helpers ---

  const getResultText = () => {
    if (result === "draw") return "It's a Draw!";
    return result === "p1" ? "You Win!" : "AI Wins!";
  };

  const getResultColor = () => {
    if (result === "draw") return "text-gray-500 dark:text-gray-400";
    if (result === "p1") return "text-blue-500 dark:text-blue-400";
    return "text-rose-500 dark:text-rose-400";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-gray-400">Rock</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-gray-400">Paper</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-blue-500">Scissors</span>
        </h1>
        {/* Simple Label instead of Switcher */}
        <div className="flex items-center justify-center gap-2 mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
          <Cpu size={16} /> Single Player Mode
        </div>
      </div>

      {/* Score Board */}
      <div className="flex justify-center gap-8 mb-8 w-full max-w-md">
        <div className="text-center">
          <div className="text-xs font-bold uppercase text-gray-400 mb-1">
            You
          </div>
          <div className="text-3xl font-bold text-blue-500">{scores.p1}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold uppercase text-gray-400 mb-1">
            vs
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold uppercase text-gray-400 mb-1">
            AI
          </div>
          <div className="text-3xl font-bold text-rose-500">{scores.p2}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative min-h-[400px] flex flex-col">
        {/* --- STATE: RESULT REVEAL --- */}
        {gameState === "result" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center animate-bounce-short">
                <div className="text-8xl mb-2 filter drop-shadow-xl transform -rotate-12">
                  {p1Choice.icon}
                </div>
                <div className="text-sm font-bold text-blue-500">You</div>
              </div>
              <div className="text-2xl font-black text-gray-300">VS</div>
              <div className="text-center animate-bounce-short delay-100">
                <div className="text-8xl mb-2 filter drop-shadow-xl transform rotate-12">
                  {p2Choice.icon}
                </div>
                <div className="text-sm font-bold text-rose-500">AI</div>
              </div>
            </div>

            <h2
              className={`text-3xl font-black mb-8 ${getResultColor()} animate-in slide-in-from-bottom-5 duration-500`}
            >
              {getResultText()}
            </h2>

            <button
              onClick={resetRound}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
            >
              <RotateCcw size={20} /> Play Again
            </button>
          </div>
        )}

        {/* --- STATE: CHOOSING --- */}
        {gameState === "idle" && (
          <div className="flex-1 flex flex-col p-8">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  Make your move
                </h3>
                <p className="text-gray-400 text-sm">Select your weapon</p>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id)}
                    className="group relative aspect-square bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                      {choice.icon}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-500">
                      {choice.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RPS;
