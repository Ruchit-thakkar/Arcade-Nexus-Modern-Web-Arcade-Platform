

---

# 🎮 Arcade Nexus

**Arcade Nexus** is a modern web-based arcade platform built using **React**, **Vite**, and **Tailwind CSS**.
It hosts multiple classic games in a clean, fast, and immersive single-page application with smooth navigation, keyboard shortcuts, and a scalable architecture.

No installs. No ads. Just pure gameplay.

---

## 🚀 Features

* 🕹️ **Multiple Classic Games**

  * Tic-Tac-Toe
  * Connect Four
  * Rock Paper Scissors
  * Memory Match
  * Snake
  * Sudoku
  * 2048
  * Chess

* ⚡ **Fast & Lightweight**

  * Powered by Vite for instant dev startup and optimized builds

* 🔍 **Global Search (Ctrl + K)**

  * Quickly find and launch any game

* 🎨 **Modern UI / UX**

  * Tailwind CSS styling
  * Glassmorphism & ambient effects
  * Responsive across devices

* 🧩 **Modular Game Architecture**

  * Each game is isolated in its own component
  * Easy to add new games without touching core logic

* ⌨️ **Keyboard & Accessibility Friendly**

  * Keyboard shortcuts
  * Clean focus handling

* 🌐 **Client-Side Routing**

  * Smooth navigation using React Router

---

## 🧠 Tech Stack

* **Frontend:** React (Hooks, Functional Components)
* **Bundler:** Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **Icons:** Lucide React
* **Linting:** ESLint

---

## 📁 Project Structure

```txt
node_modules/
public/
src/
 ├── assets/
 ├── pages/
 │   ├── Home.jsx
 │   ├── TicTacToe.jsx
 │   ├── ConnectFour.jsx
 │   ├── RPS.jsx
 │   ├── MemoryMatch.jsx
 │   ├── SnakeGame.jsx
 │   ├── Sudoku.jsx
 │   ├── ChessGame.jsx
 │   ├── Game2048.jsx
 ├── App.jsx
 ├── App.css
 ├── index.css
 └── main.jsx
.gitignore
eslint.config.js
index.html
package.json
package-lock.json
vite.config.js
README.md
```

---

## 🧩 Architecture Overview

* **Game Registry Pattern**

  * All games are registered in a single configuration object
  * Routing and search are automatically derived from it

* **Reusable UI Components**

  * Navbar
  * Search Modal
  * Game Cards
  * Not-Found Screen

* **Scalable Design**

  * Add a new game by:

    1. Creating a new page component
    2. Registering it in the `GAMES` array

---

## ▶️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/arcade-nexus.git
cd arcade-nexus
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run the Development Server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## 🛠️ Adding a New Game

1. Create a new component inside `src/pages/`
2. Register the game inside the `GAMES` array in `App.jsx`
3. Map the ID to the component in `getComponent()`

That’s it—no refactoring required.

---

## 👤 Author

**Ruchit**
Frontend Developer | UI-Focused Engineer
Crafted with passion under **DevNex**

* GitHub: [https://github.com/Ruchit-thakkar](https://github.com/Ruchit-thakkar)
* Portfolio: [https://ruchit-portfolio007.netlify.app](https://ruchit-portfolio007.netlify.app)
* LinkedIn: [https://www.linkedin.com/in/ruchit-thakkar-38ab37379](https://www.linkedin.com/in/ruchit-thakkar-38ab37379)

---

## 📜 License

This project is open-source and available for learning, experimentation, and personal use.

---

