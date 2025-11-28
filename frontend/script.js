const board = document.getElementById("board");
let gameBoard = Array(9).fill(null);
let moveCount = 0;

// Add quantum info display
const infoDiv = document.createElement("div");
infoDiv.id = "quantum-info";
infoDiv.style.marginTop = "20px";
infoDiv.style.fontFamily = "monospace";
document.body.appendChild(infoDiv);

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.onclick = () => makeMove(i, cell);
    board.appendChild(cell);
}

async function makeMove(index, cell) {
    if (gameBoard[index] !== null) {
        alert("Cell already taken!");
        return;
    }

    cell.style.pointerEvents = "none";
    
    // Show quantum processing
    cell.textContent = "⚛️";
    cell.style.opacity = "0.5";

    try {
        const res = await fetch("http://localhost:5000/api/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cell: index }),
        });

        const data = await res.json();

        // Quantum measurement determines symbol
        const symbol = data.rawQuantumResult.classicalRegister % 2 === 0 ? "O" : "X";
        
        cell.textContent = symbol;
        cell.style.opacity = "1";
        gameBoard[index] = symbol;
        moveCount++;

        // Display quantum information
        displayQuantumInfo(data, symbol, moveCount);

        // Check for winner
        if (checkWinner()) {
            setTimeout(() => {
                alert(`${checkWinner()} wins via quantum collapse! 🎉⚛️`);
                resetGame();
            }, 100);
        } else if (gameBoard.every(cell => cell !== null)) {
            setTimeout(() => {
                alert("Quantum superposition resolved to a draw! 🌀");
                resetGame();
            }, 100);
        }

    } catch (error) {
        console.error("Quantum measurement error:", error);
        alert("Quantum decoherence detected! Try again.");
        cell.textContent = "";
        cell.style.opacity = "1";
    }

    cell.style.pointerEvents = "auto";
}

function displayQuantumInfo(data, symbol, move) {
    const info = `
        <h3>🔬 Quantum Measurement #${move}</h3>
        <strong>Measured State:</strong> |${data.rawQuantumResult.measured}⟩<br>
        <strong>Classical Register:</strong> ${data.rawQuantumResult.classicalRegister}<br>
        <strong>Collapsed to:</strong> ${symbol}<br>
        <strong>Quantum State:</strong> ${data.rawQuantumResult.quantumState}<br>
        <hr>
    `;
    document.getElementById("quantum-info").innerHTML = info + 
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
    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
    });
    document.getElementById("quantum-info").innerHTML = "<h3>New quantum game started</h3>";
}