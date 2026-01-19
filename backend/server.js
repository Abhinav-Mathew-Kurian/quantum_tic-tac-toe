const express = require("express");
const cors = require("cors");
const path = require("path");
const { simulateQuantumMove } = require("./quantumEngine");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Serve frontend as static files
 * This makes index.html accessible
 */
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

/**
 * API route
 */
app.post("/api/move", (req, res) => {
    console.log("\n" + "=".repeat(60));
    console.log("Move request received");
    console.log("=".repeat(60));

    const boardState = req.body.boardState || Array(9).fill(null);
    console.log("Current board:", boardState);

    const result = simulateQuantumMove(boardState);

    console.log("Quantum Analysis:");
    console.log("Symbol:", result.symbol);
    console.log("Chosen Cell:", result.chosenCell);

    res.json(result);
});

/**
 * Default route — loads index.html
 * Important for Render & direct browser access
 */
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Quantum Tic-Tac-Toe running on port ${PORT}`);
});
