// ============================================================================
// INTELLIGENT QUANTUM TIC-TAC-TOE ENGINE
// ============================================================================
// This engine combines REAL tic-tac-toe strategy with quantum analysis.
// It checks for wins/blocks first, then uses quantum features for tactical moves.
// ============================================================================

const QuantumCircuit = require("quantum-circuit");

// ============================================================================
// CLASSICAL STRATEGY: Smart Tic-Tac-Toe Logic
// ============================================================================

/**
 * Check if a move at cellIndex would create a win for symbol
 * 
 * @param {Array} board - Current board state
 * @param {number} cellIndex - Cell to check
 * @param {string} symbol - 'X' or 'O'
 * @returns {boolean} True if this move wins
 */
function isWinningMove(board, cellIndex, symbol) {
    if (board[cellIndex] !== null) return false;
    
    // Simulate the move
    const testBoard = [...board];
    testBoard[cellIndex] = symbol;
    
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]               // Diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        
        // Check if all three are the same symbol
        if (testBoard[a] === symbol && 
            testBoard[b] === symbol && 
            testBoard[c] === symbol) {
            return true;
        }
    }
    
    return false;
}

/**
 * Find all cells where symbol can win
 * 
 * @param {Array} board - Current board state
 * @param {string} symbol - 'X' or 'O'
 * @returns {Array} Array of cell indices that win
 */
function findAllWinningMoves(board, symbol) {
    const winningMoves = [];
    
    for (let i = 0; i < 9; i++) {
        if (isWinningMove(board, i, symbol)) {
            winningMoves.push(i);
        }
    }
    
    return winningMoves;
}

/**
 * Check if we're creating a fork (two ways to win).
 * A fork is when you create two threats at once.
 * 
 * @param {Array} board - Current board state
 * @param {number} cellIndex - Cell we're considering
 * @param {string} symbol - Our symbol
 * @returns {boolean} True if this creates a fork
 */
function createsFork(board, cellIndex, symbol) {
    const testBoard = [...board];
    testBoard[cellIndex] = symbol;
    
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    let threats = 0;
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const cells = [testBoard[a], testBoard[b], testBoard[c]];
        
        const ourCount = cells.filter(cell => cell === symbol).length;
        const emptyCount = cells.filter(cell => cell === null).length;
        
        // A threat is 2 of ours + 1 empty
        if (ourCount === 2 && emptyCount === 1) {
            threats++;
        }
    }
    
    // Fork = 2 or more threats
    return threats >= 2;
}

// ============================================================================
// QUANTUM ENCODING: Convert Board State to Quantum Circuit
// ============================================================================

function encodeBoard(boardState) {
    const circuit = new QuantumCircuit(4);
    
    // First encoding layer - RY rotations
    for (let i = 0; i < 9; i++) {
        let cellValue = 0;
        if (boardState[i] === 'X') cellValue = 1;
        else if (boardState[i] === 'O') cellValue = -1;
        
        const angle = (cellValue + 1) * Math.PI;
        const qubit = i % 4;
        
        circuit.addGate("ry", -1, qubit, {
            params: { theta: angle }
        });
    }
    
    // Entanglement layer
    circuit.addGate("cx", -1, [0, 1]);
    circuit.addGate("cx", -1, [1, 2]);
    circuit.addGate("cx", -1, [2, 3]);
    
    // Second encoding layer - RX rotations
    for (let i = 0; i < 9; i++) {
        let cellValue = 0;
        if (boardState[i] === 'X') cellValue = 1;
        else if (boardState[i] === 'O') cellValue = -1;
        
        const angle = (cellValue + 1) * Math.PI / 2;
        const qubit = i % 4;
        
        circuit.addGate("rx", -1, qubit, {
            params: { theta: angle }
        });
    }
    
    return circuit;
}

// ============================================================================
// QUANTUM FEATURE EXTRACTION
// ============================================================================

function extractQuantumFeatures(circuit) {
    circuit.run();
    const probs = circuit.probabilities();
    
    const entropy = -probs.reduce((sum, p) => {
        return sum + (p > 1e-10 ? p * Math.log2(p) : 0);
    }, 0);
    
    const purity = probs.reduce((sum, p) => sum + p * p, 0);
    
    const dominantStates = probs
        .map((p, idx) => ({ state: idx, prob: p }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 3);
    
    return { 
        probabilities: probs, 
        entropy, 
        purity, 
        dominantStates 
    };
}

// ============================================================================
// MOVE SCORING: Combine Classical Strategy + Quantum Analysis
// ============================================================================

function scoreMove(boardState, cellIndex) {
    const symbol = 'O';
    const opponent = 'X';
    
    if (boardState[cellIndex] !== null) {
        return { score: -Infinity, features: null, strategy: 'invalid' };
    }
    
    let score = 0;
    let strategy = 'quantum';
    
    // ========================================================================
    // PRIORITY 1: IMMEDIATE WIN (100,000 points!)
    // ========================================================================
    if (isWinningMove(boardState, cellIndex, symbol)) {
        score = 100000;
        strategy = 'WINNING MOVE!';
        
        // Still get quantum features for display
        const testBoard = [...boardState];
        testBoard[cellIndex] = symbol;
        const circuit = encodeBoard(testBoard);
        const features = extractQuantumFeatures(circuit);
        
        return {
            score,
            features: {
                entropy: features.entropy,
                purity: features.purity
            },
            strategy
        };
    }
    
    // ========================================================================
    // PRIORITY 2: BLOCK OPPONENT WIN (90,000 points)
    // ========================================================================
    if (isWinningMove(boardState, cellIndex, opponent)) {
        score = 90000;
        strategy = 'BLOCK WIN!';
        
        const testBoard = [...boardState];
        testBoard[cellIndex] = symbol;
        const circuit = encodeBoard(testBoard);
        const features = extractQuantumFeatures(circuit);
        
        return {
            score,
            features: {
                entropy: features.entropy,
                purity: features.purity
            },
            strategy
        };
    }
    
    // For non-critical moves, calculate quantum features
    const testBoard = [...boardState];
    testBoard[cellIndex] = symbol;
    const circuit = encodeBoard(testBoard);
    const features = extractQuantumFeatures(circuit);
    
    // ========================================================================
    // PRIORITY 3: CREATE FORK (two winning threats)
    // ========================================================================
    if (createsFork(boardState, cellIndex, symbol)) {
        score += 5000;
        strategy = 'fork';
    }
    
    // ========================================================================
    // PRIORITY 4: BLOCK OPPONENT'S FORK
    // ========================================================================
    if (createsFork(boardState, cellIndex, opponent)) {
        score += 4000;
        strategy = 'block_fork';
    }
    
    // ========================================================================
    // PRIORITY 5: CENTER CONTROL (classic strategy)
    // ========================================================================
    if (cellIndex === 4 && boardState[4] === null) {
        score += 3000;
        strategy = 'center';
    }
    
    // ========================================================================
    // PRIORITY 6: OPPOSITE CORNER (if opponent in corner)
    // ========================================================================
    const corners = [[0, 8], [2, 6]];
    for (let [c1, c2] of corners) {
        if (boardState[c1] === opponent && boardState[c2] === null && cellIndex === c2) {
            score += 2500;
            strategy = 'opposite_corner';
        }
        if (boardState[c2] === opponent && boardState[c1] === null && cellIndex === c1) {
            score += 2500;
            strategy = 'opposite_corner';
        }
    }
    
    // ========================================================================
    // PRIORITY 7: EMPTY CORNER
    // ========================================================================
    if ([0, 2, 6, 8].includes(cellIndex)) {
        score += 2000;
        if (strategy === 'quantum') strategy = 'corner';
    }
    
    // ========================================================================
    // QUANTUM FEATURES: Fine-tuning between similar moves
    // ========================================================================
    // These add smaller values to break ties
    score += (4 - features.entropy) * 10;
    score += features.purity * 50;
    
    const cellInDominant = features.dominantStates.some(s => 
        (s.state % 9) === cellIndex
    );
    if (cellInDominant) {
        score += 30;
    }
    
    score += features.dominantStates[0].prob * 20;
    
    // ========================================================================
    // EDGE BONUS (less important)
    // ========================================================================
    if ([1, 3, 5, 7].includes(cellIndex)) {
        score += 500;
        if (strategy === 'quantum') strategy = 'edge';
    }
    
    return { 
        score, 
        features: {
            entropy: features.entropy,
            purity: features.purity
        },
        strategy
    };
}

// ============================================================================
// MAIN AI FUNCTION: Intelligent Move Selection
// ============================================================================

function simulateQuantumMove(boardState = Array(9).fill(null)) {
    const symbol = 'O';
    const opponent = 'X';
    
    // ========================================================================
    // ANALYZE ALL POSSIBLE MOVES
    // ========================================================================
    const moveAnalysis = [];
    
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        if (boardState[cellIndex] === null) {
            const { score, features, strategy } = scoreMove(boardState, cellIndex);
            
            moveAnalysis.push({
                cellIndex,
                score,
                entropy: features.entropy,
                purity: features.purity,
                strategy
            });
        }
    }
    
    // Sort by score
    moveAnalysis.sort((a, b) => b.score - a.score);
    
    // Choose best move
    const chosenMove = moveAnalysis[0];
    
    // Get final quantum state
    const finalBoard = [...boardState];
    finalBoard[chosenMove.cellIndex] = symbol;
    const finalCircuit = encodeBoard(finalBoard);
    const finalFeatures = extractQuantumFeatures(finalCircuit);
    
    return {
        chosenCell: chosenMove.cellIndex,
        moveAnalysis: moveAnalysis,
        symbol: symbol,
        rawQuantumResult: {
            measured: "Strategic analysis complete",
            classicalRegister: chosenMove.cellIndex,
            probabilities: finalFeatures.probabilities.slice(0, 16),
            entropy: finalFeatures.entropy.toFixed(3),
            purity: finalFeatures.purity.toFixed(3),
            quantumState: `Strategy: ${chosenMove.strategy.toUpperCase()} | Cell ${chosenMove.cellIndex} | Score: ${chosenMove.score.toFixed(0)}`
        }
    };
}

module.exports = { simulateQuantumMove };