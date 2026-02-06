import React from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Trophy,
  Zap,
  Grid3X3,
  Brain,
  Ghost,
  Hash,
  Layers,
  Crown,
  Play,
  Github,
  Terminal,
} from "lucide-react";

// ... [Keep your existing Illustrations object here unchanged] ...
const Illustrations = {
  TicTacToe: () => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
    >
      <path d="M35 15V85" className="text-blue-500/30" />
      <path d="M65 15V85" className="text-blue-500/30" />
      <path d="M15 35H85" className="text-blue-500/30" />
      <path d="M15 65H85" className="text-blue-500/30" />
      <path d="M25 25L45 45M45 25L25 45" className="text-blue-400" />
      <circle cx="75" cy="75" r="12" className="text-purple-400" />
    </svg>
  ),
  ConnectFour: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        rx="8"
        className="fill-rose-500/20 stroke-rose-500/50 stroke-2"
      />
      <circle cx="35" cy="35" r="8" className="fill-slate-900" />
      <circle cx="65" cy="35" r="8" className="fill-slate-900" />
      <circle cx="35" cy="65" r="8" className="fill-rose-500" />
      <circle cx="65" cy="65" r="8" className="fill-rose-400" />
    </svg>
  ),
  RPS: () => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 50L35 35L45 45L60 30" className="text-emerald-400" />
      <circle
        cx="70"
        cy="30"
        r="5"
        className="text-emerald-400 fill-emerald-400"
      />
      <path d="M20 70H50L60 60" className="text-emerald-600" />
    </svg>
  ),
  Memory: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect
        x="20"
        y="20"
        width="25"
        height="35"
        rx="4"
        className="fill-violet-500"
        transform="rotate(-10 32.5 37.5)"
      />
      <rect
        x="55"
        y="20"
        width="25"
        height="35"
        rx="4"
        className="fill-violet-900 stroke-violet-500 stroke-2"
        transform="rotate(10 67.5 37.5)"
      />
      <path
        d="M60 35L75 50"
        stroke="currentColor"
        strokeWidth="3"
        className="text-violet-400"
      />
      <path
        d="M75 35L60 50"
        stroke="currentColor"
        strokeWidth="3"
        className="text-violet-400"
      />
    </svg>
  ),
  Snake: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="10"
        className="stroke-cyan-500/30 stroke-2"
      />
      <path
        d="M30 70H50V50H70"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-cyan-400"
      />
      <circle cx="70" cy="30" r="5" className="fill-orange-400 animate-pulse" />
    </svg>
  ),
  Sudoku: () => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        strokeWidth="4"
        className="text-indigo-500"
      />
      <path
        d="M40 20V80M60 20V80M20 40H80M20 60H80"
        strokeWidth="2"
        className="text-indigo-500/40"
      />
      <text
        x="43"
        y="55"
        fontSize="24"
        fill="currentColor"
        className="text-indigo-300 font-bold"
        style={{ fontFamily: "monospace" }}
      >
        9
      </text>
    </svg>
  ),
  Game2048: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        rx="8"
        className="fill-amber-500/20 stroke-amber-500/50 stroke-2"
      />
      <rect
        x="25"
        y="25"
        width="20"
        height="20"
        rx="4"
        className="fill-amber-500"
      />
      <rect
        x="55"
        y="25"
        width="20"
        height="20"
        rx="4"
        className="fill-orange-600"
      />
      <rect
        x="25"
        y="55"
        width="50"
        height="20"
        rx="4"
        className="fill-amber-300"
      />
    </svg>
  ),
  Chess: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
      <path
        d="M35 75h30c2 0 3-2 3-5s-3-5-5-5h-20c-2 0-5 2-5 5s1 5 3 5z"
        className="text-slate-600"
      />
      <path
        d="M50 20c-5 0-10 4-10 10 0 5 3 8 5 12l-5 15h20l-5-15c2-4 5-7 5-12 0-6-5-10-10-10z"
        className="text-slate-200"
      />
      <path d="M48 15h4v5h-4z" className="text-slate-200" />
    </svg>
  ),
};

const Home = () => {
  const scrollToGames = () => {
    document
      .getElementById("games-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="animate-in fade-in duration-700 relative">
      {/* Hero Section */}
      <div className="relative text-center max-w-5xl mx-auto mb-32 pt-16 lg:pt-24 px-4">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -z-10" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-8 backdrop-blur-md hover:border-cyan-400/50 transition-colors cursor-default">
          <Terminal size={14} className="text-cyan-400" />
          <span className="text-xs font-bold tracking-widest text-cyan-100 uppercase font-mono">
            System Online <span className="text-cyan-500 mx-1">|</span> v2.0
          </span>
        </div>

        {/* Hero Section - Option 1: The Titan */}
        <h1 className="flex flex-col items-center justify-center font-black tracking-tighter leading-[0.85] select-none mb-10">
          {/* Layer 1: ARCADE */}
          <span
            className="text-[6vw] text-slate-200"
            style={{
              textShadow:
                "4px 4px 0px #334155, 8px 8px 0px #1e293b, 12px 12px 0px rgba(0,0,0,0.5)",
            }}
          >
            ARCADE
          </span>

          {/* Layer 2: NEXUS */}
          <span
            className="text-[6vw] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
            style={{ filter: "drop-shadow(0px 0px 30px rgba(6,182,212,0.5))" }}
          >
            NEXUS
          </span>
        </h1>
        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium mb-10">
          A next-generation collection of strategy and logic games.
          <br className="hidden md:block" />
          <span className="text-slate-300">
            Zero installs. No ads. Pure gameplay.
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToGames}
            className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <Play size={20} fill="currentColor" /> Start Playing
            </span>
          </button>

          <a
            href=""
            className="px-8 py-4 bg-slate-900/50 text-white font-semibold rounded-full border border-slate-700 hover:bg-slate-800 hover:border-slate-500 transition-all backdrop-blur-sm flex items-center gap-2"
          >
            <Github size={20} /> Source Code
          </a>
        </div>
      </div>

      {/* Game Grid Section */}
      <div id="games-grid" className="scroll-mt-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent flex-1" />
          <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            Select Cartridge
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <GameCard
            to="/tic-tac-toe"
            title="Tic-Tac-Toe"
            desc="The classic Xs and Os."
            icon={<Grid3X3 size={20} />}
            Illustration={Illustrations.TicTacToe}
            color="blue"
          />

          <GameCard
            to="/connect-four"
            title="Connect Four"
            desc="Strategy & gravity."
            icon={<Gamepad2 size={20} />}
            Illustration={Illustrations.ConnectFour}
            color="rose"
          />

          <GameCard
            to="/rps"
            title="RPS"
            desc="Rock, Paper, Scissors."
            icon={<Trophy size={20} />}
            Illustration={Illustrations.RPS}
            color="emerald"
          />

          <GameCard
            to="/memory"
            title="Memory"
            desc="Test your focus."
            icon={<Brain size={20} />}
            Illustration={Illustrations.Memory}
            color="violet"
          />

          <GameCard
            to="/snake"
            title="Snake"
            desc="Retro arcade action."
            icon={<Ghost size={20} />}
            Illustration={Illustrations.Snake}
            color="cyan"
          />

          <GameCard
            to="/sudoku"
            title="Sudoku"
            desc="Logic puzzles."
            icon={<Hash size={20} />}
            Illustration={Illustrations.Sudoku}
            color="indigo"
          />

          <GameCard
            to="/2048"
            title="2048"
            desc="Merge the numbers."
            icon={<Layers size={20} />}
            Illustration={Illustrations.Game2048}
            color="amber"
            isNew
          />

          <GameCard
            to="/chess"
            title="Chess"
            desc="The game of kings."
            icon={<Crown size={20} />}
            Illustration={Illustrations.Chess}
            color="slate"
            isHot
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Card Component (Unchanged from previous design to maintain consistency)
const GameCard = ({
  to,
  title,
  desc,
  icon,
  Illustration,
  color,
  isNew,
  isHot,
}) => {
  const colorMap = {
    blue: "hover:border-blue-500/50 hover:shadow-blue-500/20 group-hover:text-blue-400",
    rose: "hover:border-rose-500/50 hover:shadow-rose-500/20 group-hover:text-rose-400",
    emerald:
      "hover:border-emerald-500/50 hover:shadow-emerald-500/20 group-hover:text-emerald-400",
    violet:
      "hover:border-violet-500/50 hover:shadow-violet-500/20 group-hover:text-violet-400",
    cyan: "hover:border-cyan-500/50 hover:shadow-cyan-500/20 group-hover:text-cyan-400",
    indigo:
      "hover:border-indigo-500/50 hover:shadow-indigo-500/20 group-hover:text-indigo-400",
    amber:
      "hover:border-amber-500/50 hover:shadow-amber-500/20 group-hover:text-amber-400",
    slate:
      "hover:border-slate-400/50 hover:shadow-white/10 group-hover:text-white",
  };

  const bgMap = {
    blue: "group-hover:bg-blue-500/10",
    rose: "group-hover:bg-rose-500/10",
    emerald: "group-hover:bg-emerald-500/10",
    violet: "group-hover:bg-violet-500/10",
    cyan: "group-hover:bg-cyan-500/10",
    indigo: "group-hover:bg-indigo-500/10",
    amber: "group-hover:bg-amber-500/10",
    slate: "group-hover:bg-slate-700/50",
  };

  return (
    <Link
      to={to}
      className={`group relative flex flex-col p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorMap[color]}`}
    >
      {isNew && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
          NEW
        </div>
      )}
      {isHot && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1">
          <Zap size={10} /> HOT
        </div>
      )}

      <div
        className={`w-full aspect-[4/3] rounded-xl mb-4 p-6 flex items-center justify-center bg-slate-950 border border-slate-900/50 transition-colors ${bgMap[color]}`}
      >
        <div className="w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Illustration />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Arcade
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-200">{title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{desc}</p>
      </div>
    </Link>
  );
};

export default Home;
