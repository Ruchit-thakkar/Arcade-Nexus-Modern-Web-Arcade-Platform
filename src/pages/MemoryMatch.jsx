import React, { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Trophy,
  Sparkles,
  Ghost,
  Heart,
  Star,
  Moon,
  Sun,
  Cloud,
  Zap,
  Anchor,
  Gamepad2,
} from "lucide-react";

// --- Configuration ---
const ICONS = [
  { name: "ghost", icon: Ghost, color: "text-purple-400" },
  { name: "heart", icon: Heart, color: "text-rose-400" },
  { name: "star", icon: Star, color: "text-yellow-400" },
  { name: "moon", icon: Moon, color: "text-indigo-400" },
  { name: "sun", icon: Sun, color: "text-orange-400" },
  { name: "cloud", icon: Cloud, color: "text-cyan-400" },
  { name: "zap", icon: Zap, color: "text-amber-400" },
  { name: "anchor", icon: Anchor, color: "text-blue-400" },
];

// --- Sub-Component: The Card ---
const Card = ({ item, isFlipped, isMatched, onClick }) => {
  const Icon = item.icon;

  return (
    <div
      className={`relative w-full aspect-square cursor-pointer group select-none`}
      style={{ perspective: "1000px" }} // Force 3D perspective
      onClick={() => onClick(item.uniqueId)}
    >
      <div
        className={`w-full h-full relative rounded-xl shadow-lg transition-all duration-500
          ${isMatched ? "opacity-50 ring-4 ring-green-500/50 scale-95" : "hover:-translate-y-1 hover:shadow-cyan-500/20 border border-slate-700/50"}
        `}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT (Face Down) */}
        <div
          className="absolute inset-0 bg-slate-800 flex items-center justify-center rounded-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Gamepad2 className="text-slate-600 opacity-20 w-8 h-8" />
        </div>

        {/* BACK (Face Up) */}
        <div
          className={`absolute inset-0 bg-slate-700 rounded-xl flex items-center justify-center border-2 
            ${isMatched ? "border-green-500/50 bg-green-900/10" : "border-slate-600"}
          `}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Icon
            className={`w-1/2 h-1/2 ${item.color} drop-shadow-md`}
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  );
};

// --- Main Game Component ---
const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(true); // Start locked for preview
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState(
    localStorage.getItem("memory-best") || "-",
  );

  // Game Setup
  const initializeGame = useCallback(() => {
    // 1. Reset States
    setFlippedIds([]);
    setMatchedIds([]);
    setMoves(0);
    setGameWon(false);
    setIsLocked(true);

    // 2. Create & Shuffle Deck
    const pairs = [...ICONS, ...ICONS].map((item, index) => ({
      ...item,
      uniqueId: index,
    }));

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    setCards(pairs);

    // 3. Preview Phase (Show all cards for 2s)
    const allIds = pairs.map((p) => p.uniqueId);
    setFlippedIds(allIds);

    // Timer to hide cards and unlock game
    const timer = setTimeout(() => {
      setFlippedIds([]);
      setIsLocked(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Run once on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle Card Click
  const handleCardClick = (uniqueId) => {
    // Logic Guard: Prevent clicking if locked, already flipped, or matched
    if (
      isLocked ||
      flippedIds.includes(uniqueId) ||
      matchedIds.includes(uniqueId)
    )
      return;

    // Flip the clicked card
    const newFlipped = [...flippedIds, uniqueId];
    setFlippedIds(newFlipped);

    // If 2 cards are flipped, check for match
    if (newFlipped.length === 2) {
      setIsLocked(true); // Lock board immediately
      setMoves((prev) => prev + 1);

      const [id1, id2] = newFlipped;
      const card1 = cards.find((c) => c.uniqueId === id1);
      const card2 = cards.find((c) => c.uniqueId === id2);

      if (card1.name === card2.name) {
        // MATCH!
        setMatchedIds((prev) => {
          const newMatched = [...prev, id1, id2];
          if (newMatched.length === cards.length) handleWin(moves + 1);
          return newMatched;
        });
        setFlippedIds([]); // Clear flipped (visuals handled by isMatched)
        setIsLocked(false); // Unlock immediately
      } else {
        // NO MATCH: Wait 1s then unflip
        setTimeout(() => {
          setFlippedIds([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleWin = (finalMoves) => {
    setGameWon(true);
    const currentBest = localStorage.getItem("memory-best");
    if (!currentBest || finalMoves < parseInt(currentBest)) {
      localStorage.setItem("memory-best", finalMoves);
      setBestScore(finalMoves);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans text-gray-100">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Memory Match
        </h1>
        <div className="flex justify-center gap-4 text-sm font-bold text-slate-400">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <RotateCcw size={14} /> Moves:{" "}
            <span className="text-cyan-400">{moves}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <Trophy size={14} /> Best:{" "}
            <span className="text-yellow-400">{bestScore}</span>
          </div>
        </div>
        {isLocked && !gameWon && moves === 0 && (
          <p className="text-xs text-cyan-400 animate-pulse">
            Memorize the grid...
          </p>
        )}
      </div>

      {/* Grid Area */}
      <div className="relative w-full max-w-md">
        <div
          className={`grid grid-cols-4 gap-3 sm:gap-4 transition-all duration-500 ${gameWon ? "opacity-20 blur-[2px]" : "opacity-100"}`}
        >
          {cards.map((card) => (
            <Card
              key={card.uniqueId}
              item={card}
              // Card is visible if: It's in flipped list OR it's already matched
              isFlipped={
                flippedIds.includes(card.uniqueId) ||
                matchedIds.includes(card.uniqueId)
              }
              isMatched={matchedIds.includes(card.uniqueId)}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* Win Modal */}
        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center z-20 animate-in zoom-in duration-300">
            <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700 text-center w-full max-w-sm mx-4">
              <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-black text-white mb-2">
                Excellent!
              </h2>
              <p className="text-slate-400 mb-6">
                Cleared in <span className="text-white font-bold">{moves}</span>{" "}
                moves.
              </p>
              <button
                onClick={initializeGame}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
