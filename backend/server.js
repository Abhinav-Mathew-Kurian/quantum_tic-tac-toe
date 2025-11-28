const express = require("express");
const cors = require("cors");
const { simulateQuantumMove } = require("./quantumEngine");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/move", (req, res) => {
    console.log("Move request received:", req.body);
    
    const result = simulateQuantumMove();
    
    console.log("Quantum result:", result);
    
    res.json(result);
});

app.listen(5000, () => {
    console.log("Quantum Tic-Tac-Toe backend running on port 5000");
});
