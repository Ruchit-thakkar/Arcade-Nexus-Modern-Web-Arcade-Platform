import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Play,
  RotateCcw,
  Pause,
  Gamepad2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

// --- Configuration ---
const GRID_SIZE = 20;
const TICK_RATE = 150; // Base speed
const SPEED_INCREMENT = 3; // ms faster per food
const MIN_SPEED = 60; // Max speed cap

const SnakeGame = () => {
  // --- State ---
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [direction, setDirection] = useState("UP");
  const [nextDirection, setNextDirection] = useState("UP"); // Buffer for rapid inputs
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("snake-highscore") || "0"),
  );
  const [status, setStatus] = useState("IDLE"); // IDLE, PLAYING, PAUSED, GAMEOVER
  const [speed, setSpeed] = useState(TICK_RATE);

  // Refs
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef(null);

  // --- Logic ---

  const spawnFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y,
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const gameOver = () => {
    setStatus("GAMEOVER");
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snake-highscore", score.toString());
    }
  };

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection("UP");
    setNextDirection("UP");
    setScore(0);
    setSpeed(TICK_RATE);
    setStatus("PLAYING");
    setFood(spawnFood([{ x: 10, y: 10 }]));
  };

  const handleInput = useCallback((newDir) => {
    setNextDirection((prev) => {
      // Prevent 180 turns and duplicate inputs
      if (prev === "UP" && newDir === "DOWN") return prev;
      if (prev === "DOWN" && newDir === "UP") return prev;
      if (prev === "LEFT" && newDir === "RIGHT") return prev;
      if (prev === "RIGHT" && newDir === "LEFT") return prev;
      return newDir;
    });
  }, []);

  // --- Game Loop ---
  useEffect(() => {
    if (status !== "PLAYING") return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        // Update direction from buffer
        setDirection(nextDirection);

        switch (nextDirection) {
          case "UP":
            head.y -= 1;
            break;
          case "DOWN":
            head.y += 1;
            break;
          case "LEFT":
            head.x -= 1;
            break;
          case "RIGHT":
            head.x += 1;
            break;
          default:
            break;
        }

        // Wall Collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          gameOver();
          return prevSnake;
        }

        // Self Collision
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          gameOver();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food Collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood(spawnFood(newSnake));
          setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
          // Don't pop (grow)
        } else {
          newSnake.pop(); // Move
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [status, nextDirection, food, speed, spawnFood]);

  // --- Input Listeners ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (status === "IDLE" || status === "GAMEOVER") {
        if (e.key === "Enter" || e.key === " ") resetGame();
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          handleInput("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          handleInput("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          handleInput("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          handleInput("RIGHT");
          break;
        case " ":
        case "Escape":
          setStatus((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, handleInput]);

  // --- Touch / Swipe Handlers ---
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchEnd.x - touchStartRef.current.x;
    const diffY = touchEnd.y - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal
      if (Math.abs(diffX) > 30) {
        // Threshold
        handleInput(diffX > 0 ? "RIGHT" : "LEFT");
      }
    } else {
      // Vertical
      if (Math.abs(diffY) > 30) {
        handleInput(diffY > 0 ? "DOWN" : "UP");
      }
    }
    touchStartRef.current = null;
  };

  // --- Styling Helpers ---
  const getSegmentStyle = (x, y) => ({
    left: `${(x / GRID_SIZE) * 100}%`,
    top: `${(y / GRID_SIZE) * 100}%`,
    width: `${100 / GRID_SIZE}%`,
    height: `${100 / GRID_SIZE}%`,
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans touch-none select-none">
      {/* Header */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic tracking-tighter">
            NEO-SNAKE
          </h1>
          <div className="flex items-center gap-2 text-cyan-500/80 text-sm font-bold mt-1">
            <Gamepad2 size={16} /> <span>ARCADE MODE</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Score
          </div>
          <div className="text-3xl font-black text-white leading-none">
            {score}
          </div>
          <div className="text-xs text-slate-600 font-bold mt-1 flex items-center justify-end gap-1">
            <Trophy size={10} /> HI: {highScore}
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div
        className="relative bg-slate-900 rounded-xl shadow-2xl border-4 border-slate-800 overflow-hidden"
        style={{
          width: "min(90vw, 400px)",
          height: "min(90vw, 400px)",
          boxShadow:
            status === "PLAYING" ? "0 0 20px rgba(34, 211, 238, 0.2)" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Grid Lines (CSS Gradient) */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`,
          }}
        />

        {/* --- RENDER SNAKE --- */}
        {snake.map((seg, i) => {
          const isHead = i === 0;
          return (
            <div
              key={`${seg.x}-${seg.y}-${i}`}
              className={`absolute transition-all duration-75 ${isHead ? "z-20" : "z-10"}`}
              style={getSegmentStyle(seg.x, seg.y)}
            >
              <div
                className={`w-full h-full rounded-sm ${isHead ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-cyan-600/90"}`}
                style={{ transform: "scale(0.92)" }}
              >
                {isHead && (
                  <>
                    {/* Eyes */}
                    <div
                      className={`absolute w-[20%] h-[20%] bg-slate-900 rounded-full
                        ${
                          direction === "UP"
                            ? "top-[10%] left-[20%]"
                            : direction === "DOWN"
                              ? "bottom-[10%] left-[20%]"
                              : direction === "LEFT"
                                ? "top-[20%] left-[10%]"
                                : "top-[20%] right-[10%]"
                        }`}
                    />
                    <div
                      className={`absolute w-[20%] h-[20%] bg-slate-900 rounded-full
                        ${
                          direction === "UP"
                            ? "top-[10%] right-[20%]"
                            : direction === "DOWN"
                              ? "bottom-[10%] right-[20%]"
                              : direction === "LEFT"
                                ? "bottom-[20%] left-[10%]"
                                : "bottom-[20%] right-[10%]"
                        }`}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* --- RENDER FOOD --- */}
        <div
          className="absolute z-10 transition-all duration-300"
          style={getSegmentStyle(food.x, food.y)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[70%] h-[70%] bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_#a855f7]">
              <Zap size="100%" className="text-white scale-75 fill-white" />
            </div>
          </div>
        </div>

        {/* --- OVERLAYS --- */}
        {status !== "PLAYING" && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in duration-300">
            {status === "GAMEOVER" && (
              <div className="text-center mb-6">
                <h2 className="text-5xl font-black text-white mb-2 drop-shadow-[0_2px_0_rgba(239,68,68,1)]">
                  WASTED
                </h2>
                <p className="text-slate-400 font-bold">Final Score: {score}</p>
              </div>
            )}

            {status === "PAUSED" && (
              <div className="text-yellow-400 font-black text-4xl mb-6 tracking-widest">
                PAUSED
              </div>
            )}

            <button
              onClick={
                status === "PAUSED" ? () => setStatus("PLAYING") : resetGame
              }
              className="group relative px-8 py-3 bg-white text-slate-950 font-black text-lg uppercase tracking-wider skew-x-[-10deg] hover:bg-cyan-400 transition-colors"
            >
              <span className="block skew-x-[10deg] flex items-center gap-2">
                {status === "PAUSED" ? (
                  <Play size={20} fill="currentColor" />
                ) : (
                  <RotateCcw size={20} />
                )}
                {status === "PAUSED"
                  ? "Resume"
                  : status === "IDLE"
                    ? "Start Game"
                    : "Try Again"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Instructions / Mobile Controls */}
      <div className="mt-8 w-full max-w-md">
        {/* Desktop Instructions */}
        <div className="hidden sm:flex justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>WASD / Arrows to Move</span>
          <span>Space to Pause</span>
        </div>

        {/* Mobile D-Pad */}
        <div className="sm:hidden grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          <div />
          <DPadButton onClick={() => handleInput("UP")} icon={<ChevronUp />} />
          <div />
          <DPadButton
            onClick={() => handleInput("LEFT")}
            icon={<ChevronLeft />}
          />
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-slate-800"></div>
          </div>
          <DPadButton
            onClick={() => handleInput("RIGHT")}
            icon={<ChevronRight />}
          />
          <div />
          <DPadButton
            onClick={() => handleInput("DOWN")}
            icon={<ChevronDown />}
          />
          <div />
        </div>

        {/* Mobile Action Buttons */}
        <div className="sm:hidden flex justify-center mt-6 gap-4">
          <button
            onClick={() =>
              setStatus((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"))
            }
            className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 active:bg-slate-700 active:text-white transition-colors"
          >
            {status === "PAUSED" ? (
              <Play fill="currentColor" />
            ) : (
              <Pause fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DPadButton = ({ onClick, icon }) => (
  <button
    className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shadow-[0_4px_0_#1e293b] active:shadow-none active:translate-y-[4px] transition-all border-t border-slate-700"
    onPointerDown={(e) => {
      e.preventDefault(); // Prevents sticky hover states on touch
      onClick();
    }}
  >
    {icon}
  </button>
);

export default SnakeGame;
