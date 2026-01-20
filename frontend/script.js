// ============================================================================
// QUANTUM TIC-TAC-TOE - FRONTEND GAME LOGIC
// ============================================================================
// This handles the user interface and game flow for quantum tic-tac-toe.
// The human player is always 'X', and the quantum AI plays as 'O'.
// ============================================================================

// ============================================================================
// GAME STATE INITIALIZATION
// ============================================================================

// Get reference to the board element in HTML
const board = document.getElementById("board");

// Game state variables
let gameBoard = Array(9).fill(null);  // Current board: 'X', 'O', or null
let moveCount = 0;  // Total moves played (used for labeling)
let isProcessing = false;  // Prevents clicks during AI's turn

// ============================================================================
// CREATE QUANTUM INFO DISPLAY PANEL
// ============================================================================
// This div will show detailed analysis of each quantum move
const infoDiv = document.createElement("div");
infoDiv.id = "quantum-info";
infoDiv.style.marginTop = "20px";
infoDiv.style.fontFamily = "monospace";
infoDiv.style.maxHeight = "400px";
infoDiv.style.overflowY = "auto";  // Scrollable if content gets long
infoDiv.innerHTML = "<h3>🧠 Click any cell to start. You are X!</h3>";
document.body.appendChild(infoDiv);

// ============================================================================
// CREATE THE 3×3 GAME BOARD
// ============================================================================
// Generate 9 clickable cells for the tic-tac-toe board
for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;  // Store cell index (0-8)
    cell.onclick = () => makeMove(i, cell);  // Click handler
    board.appendChild(cell);
}

// ============================================================================
// MAIN GAME LOGIC: Handle User Move and AI Response
// ============================================================================
/**
 * Called when user clicks a cell. This function:
 * 1. Places user's 'X' immediately
 * 2. Checks if user won
 * 3. Calls quantum engine to get AI's 'O' move
 * 4. Places AI's move
 * 5. Checks if AI won
 * 
 * @param {number} index - Which cell (0-8) was clicked
 * @param {HTMLElement} cell - The DOM element that was clicked
 */
async function makeMove(index, cell) {
    // ========================================================================
    // VALIDATION: Ignore invalid clicks
    // ========================================================================
    
    // Can't play on occupied cell
    if (gameBoard[index] !== null) {
        return;
    }
    
    // Can't play while AI is thinking
    if (isProcessing) {
        return;
    }

    // ========================================================================
    // STEP 1: User plays 'X'
    // ========================================================================
    
    gameBoard[index] = 'X';  // Update internal state
    cell.textContent = 'X';  // Update visual display
    cell.style.pointerEvents = "none";  // Disable clicking this cell again
    moveCount++;  // Increment move counter

    // ========================================================================
    // STEP 2: Check if user won
    // ========================================================================
    
    if (checkWinner()) {
        setTimeout(() => {
            alert(`X wins! You beat the quantum engine! 🎉`);
            resetGame();
        }, 100);
        return;  // Game over
    }

    // ========================================================================
    // STEP 3: Check for draw (board full, no winner)
    // ========================================================================
    
    if (gameBoard.every(cell => cell !== null)) {
        setTimeout(() => {
            alert("Draw! The quantum engine couldn't beat you! 🌀");
            resetGame();
        }, 100);
        return;  // Game over
    }

    // ========================================================================
    // STEP 4: Quantum AI's turn to play 'O'
    // ========================================================================
    
    // Prevent user from clicking during AI's turn
    isProcessing = true;
    
    // Show "thinking" animation
    const tempDiv = document.createElement("div");
    tempDiv.style.textAlign = "center";
    tempDiv.style.marginTop = "10px";
    tempDiv.innerHTML = "🧠 Quantum engine analyzing...";
    document.body.insertBefore(tempDiv, infoDiv);

    try {
        // ====================================================================
        // API CALL: Send current board to quantum engine
        // ====================================================================
        
        const res = await fetch("/api/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boardState: gameBoard }),
        });

        const data = await res.json();  // Get AI's decision

        // Remove "thinking" animation
        tempDiv.remove();

        // Extract AI's chosen cell from response
        const aiCell = data.chosenCell;

        // ====================================================================
        // Place AI's 'O' on the board
        // ====================================================================
        
        const chosenCell = document.querySelector(`[data-index="${aiCell}"]`);
        chosenCell.textContent = 'O';  // Show 'O' visually
        chosenCell.style.pointerEvents = "none";  // Disable this cell

        // Update internal game state
        gameBoard[aiCell] = 'O';
        moveCount++;

        // ====================================================================
        // Display quantum analysis to user
        // ====================================================================
        
        displayQuantumInfo(data, 'O', moveCount);

        // ====================================================================
        // Check if AI won
        // ====================================================================
        
        if (checkWinner()) {
            setTimeout(() => {
                alert(`O wins! The quantum engine defeated you! 🧠⚛️`);
                resetGame();
            }, 100);
            return;  // Game over
        }

        // ====================================================================
        // Check for draw
        // ====================================================================
        
        if (gameBoard.every(cell => cell !== null)) {
            setTimeout(() => {
                alert("Draw! Quantum analysis resulted in a draw! 🌀");
                resetGame();
            }, 100);
            return;  // Game over
        }

    } catch (error) {
        // ====================================================================
        // ERROR HANDLING: If API call fails
        // ====================================================================
        
        tempDiv.remove();
        console.error("Quantum analysis failed:", error);
        alert("Quantum engine crashed! Try again.");
        
        // Undo user's move so they can try again
        gameBoard[index] = null;
        cell.textContent = "";
        cell.style.pointerEvents = "auto";
        moveCount--;
    }

    // Re-enable user clicks
    isProcessing = false;
}

// ============================================================================
// DISPLAY QUANTUM ANALYSIS: Show AI's Decision Process
// ============================================================================
/**
 * Creates a detailed breakdown of the quantum engine's analysis.
 * Shows all considered moves, their scores, and quantum features.
 * 
 * @param {Object} data - Response from quantum engine API
 * @param {string} symbol - Symbol played ('O')
 * @param {number} move - Current move number
 */
function displayQuantumInfo(data, symbol, move) {
    // Create HTML table showing all analyzed moves
    let analysisTable = `
        <h3>🔬 Quantum Analysis #${Math.floor(move/2)}</h3>
        <strong>AI Symbol Played:</strong> ${symbol}<br>
        <strong>Chosen Cell:</strong> ${data.chosenCell}<br>
        <strong>Strategy Used:</strong> ${data.moveAnalysis[0].strategy || 'quantum'}<br>
        <strong>Entropy:</strong> ${data.rawQuantumResult.entropy} (lower = more certain)<br>
        <strong>Purity:</strong> ${data.rawQuantumResult.purity} (higher = more focused)<br>
        <br>
        <strong>📊 Move Scores (All Options Analyzed):</strong><br>
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
            <tr style="background: rgba(255,255,255,0.1);">
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Cell</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Strategy</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Score</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Entropy</th>
                <th style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">Purity</th>
            </tr>
    `;

    // Add row for each analyzed move
    data.moveAnalysis.forEach((move, idx) => {
        const isChosen = move.cellIndex === data.chosenCell;
        const bgColor = isChosen ? 'rgba(0,255,0,0.2)' : 'transparent';
        const marker = isChosen ? '✓' : '';  // Checkmark for chosen move

        analysisTable += `
            <tr style="background: ${bgColor};">
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.cellIndex} ${marker}</td>
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3); font-size: 10px;">${move.strategy || 'quantum'}</td>
                <td style="padding: 5px; border: 1px solid rgba(255,255,255,0.3);">${move.score.toFixed(0)}</td>
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

    // Prepend new analysis (newest at top)
    document.getElementById("quantum-info").innerHTML = analysisTable +
        document.getElementById("quantum-info").innerHTML;
}

// ============================================================================
// WIN DETECTION: Check for Three in a Row
// ============================================================================
/**
 * Checks all possible winning patterns to see if anyone won.
 * 
 * @returns {string|null} 'X' if X won, 'O' if O won, null if no winner
 */
function checkWinner() {
    // All 8 possible winning combinations
    const winPatterns = [
        [0, 1, 2],  // Top row
        [3, 4, 5],  // Middle row
        [6, 7, 8],  // Bottom row
        [0, 3, 6],  // Left column
        [1, 4, 7],  // Middle column
        [2, 5, 8],  // Right column
        [0, 4, 8],  // Diagonal top-left to bottom-right
        [2, 4, 6]   // Diagonal top-right to bottom-left
    ];

    // Check each pattern
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        
        // If all three cells match and aren't empty, we have a winner
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];  // Return 'X' or 'O'
        }
    }
    
    return null;  // No winner yet
}

// ============================================================================
// GAME RESET: Start Fresh Game
// ============================================================================
/**
 * Clears the board and resets all game state for a new game.
 */
function resetGame() {
    // Reset internal state
    gameBoard = Array(9).fill(null);
    moveCount = 0;
    isProcessing = false;
    
    // Clear visual board
    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.style.pointerEvents = "auto";  // Re-enable clicking
    });
    
    // Reset info panel
    document.getElementById("quantum-info").innerHTML =
        "<h3>🧠 New game! You are X. Click any cell to start!</h3>";
}