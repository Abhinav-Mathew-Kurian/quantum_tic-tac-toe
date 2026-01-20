const board = document.getElementById("board");
let gameBoard = Array(9).fill(null);
let moveCount = 0;
let isProcessing = false; // Prevent multiple clicks during AI turn

// Add quantum info display
const infoDiv = document.createElement("div");
infoDiv.id = "quantum-info";
infoDiv.style.marginTop = "20px";
infoDiv.style.fontFamily = "monospace";
infoDiv.style.maxHeight = "400px";
infoDiv.style.overflowY = "auto";
infoDiv.innerHTML = "<h3>🧠 Click any cell to start. You are X!</h3>";
document.body.appendChild(infoDiv);

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.onclick = () => makeMove(i, cell);
    board.appendChild(cell);
}

async function makeMove(index, cell) {
    // Ignore if cell is occupied or AI is thinking
    if (gameBoard[index] !== null || isProcessing) {
        return;
    }

    // STEP 1: User plays X
    gameBoard[index] = 'X';
    cell.textContent = 'X';
    cell.style.pointerEvents = "none";
    moveCount++;

    // Check if user won
    if (checkWinner()) {
        setTimeout(() => {
            alert(`X wins! You beat the quantum engine! 🎉`);
            resetGame();
        }, 100);
        return;
    }

    // Check for draw
    if (gameBoard.every(cell => cell !== null)) {
        setTimeout(() => {
            alert("Draw! The quantum engine couldn't beat you! 🌀");
            resetGame();
        }, 100);
        return;
    }

    // STEP 2: Quantum engine plays O
    isProcessing = true;
    
    // Show quantum processing
    const tempDiv = document.createElement("div");
    tempDiv.style.textAlign = "center";
    tempDiv.style.marginTop = "10px";
    tempDiv.innerHTML = "🧠 Quantum engine analyzing...";
    document.body.insertBefore(tempDiv, infoDiv);

    try {
        // Call quantum engine with current board
        const res = await fetch("/api/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boardState: gameBoard }),
        });

        const data = await res.json();

        // Remove processing message
        tempDiv.remove();

        const aiCell = data.chosenCell;

        // Place O on the board
        const chosenCell = document.querySelector(`[data-index="${aiCell}"]`);
        chosenCell.textContent = 'O';
        chosenCell.style.pointerEvents = "none";

        // Update internal board state
        gameBoard[aiCell] = 'O';
        moveCount++;

        // Display quantum analysis
        displayQuantumInfo(data, 'O', moveCount);

        // Check if AI won
        if (checkWinner()) {
            setTimeout(() => {
                alert(`O wins! The quantum engine defeated you! 🧠⚛️`);
                resetGame();
            }, 100);
            return;
        }

        // Check for draw
        if (gameBoard.every(cell => cell !== null)) {
            setTimeout(() => {
                alert("Draw! Quantum analysis resulted in a draw! 🌀");
                resetGame();
            }, 100);
            return;
        }

    } catch (error) {
        tempDiv.remove();
        console.error("Quantum analysis failed:", error);
        alert("Quantum engine crashed! Try again.");
        // Undo user's move on error
        gameBoard[index] = null;
        cell.textContent = "";
        cell.style.pointerEvents = "auto";
        moveCount--;
    }

    isProcessing = false;
}

function displayQuantumInfo(data, symbol, move) {
    // Create analysis table
    let analysisTable = `
        <h3>🔬 Quantum Analysis #${Math.floor(move/2)}</h3>
        <strong>AI Symbol Played:</strong> ${symbol}<br>
        <strong>Chosen Cell:</strong> ${data.chosenCell}<br>
        <strong>Strategy:</strong> Analyzed all valid moves<br>
        <strong>Entropy:</strong> ${data.rawQuantumResult.entropy}<br>
        <strong>Purity:</strong> ${data.rawQuantumResult.purity}<br>
        <br>
        <strong>📊 Move Scores (All Options Analyzed):</strong><br>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr style="background: rgba(255,255,255,0.1);">
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Cell</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Score</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Entropy</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Purity</th>
            </tr>
    `;

    data.moveAnalysis.forEach((move, idx) => {
        const isChosen = move.cellIndex === data.chosenCell;
        const bgColor = isChosen ? 'rgba(0,255,0,0.2)' : 'transparent';
        const marker = isChosen ? '✓' : '';

        analysisTable += `
            <tr style="background: ${bgColor};">
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.cellIndex} ${marker}</td>
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.score.toFixed(2)}</td>
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.entropy.toFixed(2)}</td>
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.purity.toFixed(2)}</td>
            </tr>
        `;
    });

    analysisTable += `
        </table>
        <br>
        <strong>Quantum State:</strong> ${data.rawQuantumResult.quantumState}<br>
        <hr>
    `;

    document.getElementById("quantum-info").innerHTML = analysisTable +
        document.getElementById("quantum-info").innerHTML;
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];
        }
    }
    return null;
}

function resetGame() {
    gameBoard = Array(9).fill(null);
    moveCount = 0;
    isProcessing = false;
    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.style.pointerEvents = "auto";
    });
    document.getElementById("quantum-info").innerHTML =
        "<h3>🧠 New game! You are X. Click any cell to start!</h3>";
}