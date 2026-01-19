// ============================================================================
// INTELLIGENT QUANTUM ENGINE - Actually Uses Quantum Information!
// ============================================================================
// This version analyzes quantum features for all possible moves and chooses
// strategically, rather than measuring randomly.
// ============================================================================

const QuantumCircuit = require("quantum-circuit");

/**
 * STEP 1: Encode board state into quantum circuit (Feature Map)
 * 
 * Same as before - creates quantum state based on board configuration
 */
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

/**
 * STEP 2: Extract quantum features WITHOUT measuring
 * 
 * KEY DIFFERENCE: Instead of measuring randomly, we extract features:
 * - Probabilities: Likelihood of each quantum state
 * - Entropy: How "uncertain" the quantum state is
 * - Purity: How "mixed" vs "pure" the quantum state is
 * - Dominant states: Which states have highest probability
 */
function extractQuantumFeatures(circuit) {
    circuit.run();
    const probs = circuit.probabilities();
    
    // Calculate entropy: measures uncertainty in quantum state
    // Lower entropy = more certain/committed state
    const entropy = -probs.reduce((sum, p) => {
        return sum + (p > 1e-10 ? p * Math.log2(p) : 0);
    }, 0);
    
    // Calculate purity: measures how "pure" vs "mixed" the state is
    // Higher purity = more focused/coherent state
    const purity = probs.reduce((sum, p) => sum + p * p, 0);
    
    // Find dominant quantum states (top 3 most likely)
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

/**
 * STEP 3: Score a potential move based on quantum features
 * 
 * THIS IS THE INTELLIGENCE!
 * We simulate playing at each cell and evaluate the resulting quantum state
 */
function scoreMove(boardState, cellIndex, symbol) {
    // Can't play on occupied cell
    if (boardState[cellIndex] !== null) {
        return { score: -Infinity, features: null };
    }
    
    // Simulate playing this move
    const testBoard = [...boardState];
    testBoard[cellIndex] = symbol;
    
    // Encode the hypothetical board state
    const circuit = encodeBoard(testBoard);
    
    // Extract quantum features for this hypothetical state
    const features = extractQuantumFeatures(circuit);
    
    // ========================================================================
    // SCORING FUNCTION - Where quantum features become strategic
    // ========================================================================
    let score = 0;
    
    // 1. Favor moves that create LOWER entropy
    //    (Lower entropy = more "certain" quantum state = stronger position)
    score += (4 - features.entropy) * 10;
    
    // 2. Favor moves that create HIGHER purity
    //    (Higher purity = more "focused" quantum state = clearer strategy)
    score += features.purity * 50;
    
    // 3. Check if this cell appears in dominant quantum states
    //    (The quantum state naturally "wants" to collapse to this cell)
    const cellInDominant = features.dominantStates.some(s => 
        (s.state % 9) === cellIndex
    );
    if (cellInDominant) {
        score += 30;
    }
    
    // 4. Add quantum bonus from probability
    score += features.dominantStates[0].prob * 20;
    
    // 5. Classical strategy bonuses
    if (cellIndex === 4) score += 15;  // Center is valuable
    if ([0, 2, 6, 8].includes(cellIndex)) score += 10;  // Corners are good
    
    return { 
        score, 
        features: {
            entropy: features.entropy,
            purity: features.purity
        }
    };
}

/**
 * MAIN FUNCTION: Intelligent quantum move selection
 * 
 * Instead of measuring randomly, we:
 * 1. Try all possible moves
 * 2. Score each based on quantum features
 * 3. Choose the best one strategically
 */
function simulateQuantumMove(boardState = Array(9).fill(null)) {
    
    // Determine which symbol we're playing
    const xCount = boardState.filter(c => c === 'X').length;
    const oCount = boardState.filter(c => c === 'O').length;
    const symbol = xCount <= oCount ? 'X' : 'O';
    
    // ========================================================================
    // ANALYZE ALL POSSIBLE MOVES
    // ========================================================================
    const moveAnalysis = [];
    
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        if (boardState[cellIndex] === null) {
            const { score, features } = scoreMove(boardState, cellIndex, symbol);
            
            moveAnalysis.push({
                cellIndex,
                score,
                entropy: features.entropy,
                purity: features.purity
            });
        }
    }
    
    // Sort by score (best moves first)
    moveAnalysis.sort((a, b) => b.score - a.score);
    
    // ========================================================================
    // CHOOSE BEST MOVE
    // ========================================================================
    const chosenMove = moveAnalysis[0];
    
    // Get final quantum state information for display
    const finalBoard = [...boardState];
    finalBoard[chosenMove.cellIndex] = symbol;
    const finalCircuit = encodeBoard(finalBoard);
    const finalFeatures = extractQuantumFeatures(finalCircuit);
    
    return {
        chosenCell: chosenMove.cellIndex,
        moveAnalysis: moveAnalysis,  // All moves with their scores
        symbol: symbol,
        rawQuantumResult: {
            measured: "Strategic choice based on quantum feature analysis",
            classicalRegister: chosenMove.cellIndex,
            probabilities: finalFeatures.probabilities.slice(0, 16),
            entropy: finalFeatures.entropy.toFixed(3),
            purity: finalFeatures.purity.toFixed(3),
            quantumState: `Analyzed ${moveAnalysis.length} moves, chose cell ${chosenMove.cellIndex} (score: ${chosenMove.score.toFixed(2)})`
        }
    };
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = { simulateQuantumMove };