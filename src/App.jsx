import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home as HomeIcon,
  Search,
  X,
  ChevronRight,
  Gamepad2,
  Heart,
} from "lucide-react";

// Page Imports
import Home from "./pages/Home";
import TicTacToe from "./pages/TicTacToe";
import ConnectFour from "./pages/ConnectFour";
import RPS from "./pages/RPS";
import MemoryMatch from "./pages/MemoryMatch";
import SnakeGame from "./pages/SnakeGame";
import Sudoku from "./pages/Sudoku";
import ChessGame from "./pages/ChessGame";
import Game2048 from "./pages/Game2048";

// --- Configuration: Game Registry ---
const GAMES = [
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    path: "/tic-tac-toe",
    type: "Strategy",
  },
  {
    id: "connect-four",
    title: "Connect Four",
    path: "/connect-four",
    type: "Strategy",
  },
  { id: "rps", title: "Rock Paper Scissors", path: "/rps", type: "Chance" },
  { id: "memory", title: "Memory Match", path: "/memory", type: "Puzzle" },
  { id: "snake", title: "Snake", path: "/snake", type: "Arcade" },
  { id: "sudoku", title: "Sudoku", path: "/sudoku", type: "Puzzle" },
  { id: "chess", title: "Chess", path: "/chess", type: "Strategy" },
  { id: "2048", title: "2048", path: "/2048", type: "Puzzle" },
];

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* --- Global Background Ambience --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar onSearchClick={() => setIsSearchOpen(true)} />

      {/* --- Search Modal --- */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          {GAMES.map((game) => (
            <Route
              key={game.id}
              path={game.path}
              element={getComponent(game.id)}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* --- Footer --- */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-auto bg-[#0f172a]/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="text-center md:text-left">
            <p className="font-semibold text-slate-300">
              &copy; {new Date().getFullYear()} Arcade Nexus.
            </p>
            <p className="mt-1 text-slate-500 flex items-center gap-1 justify-center md:justify-start">
              Crafted with{" "}
              <Heart
                size={12}
                className="text-rose-500 fill-rose-500 animate-pulse"
              />{" "}
              by
              <span className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer">
                Ruchit
              </span>
              <span className="text-slate-600 font-mono text-xs">(DevNex)</span>
            </p>
          </div>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="https://github.com/Ruchit-thakkar"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              GitHub
            </a>
            <a
              href="https://ruchit-portfolio007.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Portfolio
            </a>
            <a
              href="www.linkedin.com/in/ruchit-thakkar-38ab37379"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper to map IDs to Components
const getComponent = (id) => {
  switch (id) {
    case "tic-tac-toe":
      return <TicTacToe />;
    case "connect-four":
      return <ConnectFour />;
    case "rps":
      return <RPS />;
    case "memory":
      return <MemoryMatch />;
    case "snake":
      return <SnakeGame />;
    case "sudoku":
      return <Sudoku />;
    case "chess":
      return <ChessGame />;
    case "2048":
      return <Game2048 />;
    default:
      return <NotFound />;
  }
};

// --- Sub-Components ---

const Navbar = ({ onSearchClick }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#0f172a]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#0f172a]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 md:w-10 md:h-10 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <span className="font-bold text-xl tracking-tight text-slate-100 block">
            Arcade<span className="text-cyan-400"> Nexus</span>
          </span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-cyan-400 transition-all text-sm group"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 border border-slate-700 rounded text-slate-500 group-hover:text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* Back Button */}
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent hover:bg-slate-800 rounded-lg"
            >
              <HomeIcon size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery(""); // Reset on close
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredGames = GAMES.filter(
    (g) =>
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.type.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="text-slate-500 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search games..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 h-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredGames.length > 0 ? (
            <div className="grid gap-1">
              <span className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Games
              </span>
              {filteredGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleSelect(game.path)}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-left hover:bg-slate-800 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                      <Gamepad2 size={16} />
                    </div>
                    <div>
                      <div className="text-slate-200 font-medium group-hover:text-white">
                        {game.title}
                      </div>
                      <div className="text-xs text-slate-500">{game.type}</div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No games found for "{query}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
          <span>
            Use <kbd className="font-sans bg-slate-800 px-1 rounded">↑</kbd>{" "}
            <kbd className="font-sans bg-slate-800 px-1 rounded">↓</kbd> to
            navigate
          </span>
          <span>
            <kbd className="font-sans bg-slate-800 px-1 rounded">Enter</kbd> to
            select
          </span>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-[70vh] text-center px-4 overflow-hidden">
      {/* --- Background Binary Effect --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-slate-500 font-mono text-xs animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              transform: `scale(${Math.random() * 2 + 0.5})`,
            }}
          >
            {Math.random() > 0.5 ? "10110" : "01001"}
          </div>
        ))}
      </div>

      {/* --- Glitch Container --- */}
      <div className="relative mb-8 group">
        <h1 className="text-[120px] md:text-[180px] font-black text-slate-800 leading-none select-none tracking-tighter transition-colors group-hover:text-slate-800/50">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative bg-[#0f172a] border-2 border-rose-500/50 px-6 py-2 rounded-lg transform -rotate-6 shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:rotate-0 hover:scale-110 transition-all duration-300">
            <span className="text-2xl md:text-4xl font-black text-rose-500 tracking-widest drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]">
              LEVEL MISSING
            </span>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-rose-500" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-rose-500" />
          </div>
        </div>
      </div>

      {/* --- Subtext --- */}
      <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto mb-8">
        The game cartridge you are looking for has been blown on too many times
        or doesn't exist.
      </p>

      {/* --- Respawn Button --- */}
      <Link
        to="/"
        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(8,145,178,0.5)]"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <Gamepad2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide text-lg">RESPAWN AT HOME</span>
      </Link>
    </div>
  );
};

export default App;
