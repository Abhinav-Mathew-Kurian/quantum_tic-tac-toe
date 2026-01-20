// ============================================================================
// INTELLIGENT QUANTUM ENGINE - Always plays O against human X
// ============================================================================

const QuantumCircuit = require("quantum-circuit");

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

function scoreMove(boardState, cellIndex) {
    // Always playing as O
    const symbol = 'O';
    
    if (boardState[cellIndex] !== null) {
        return { score: -Infinity, features: null };
    }
    
    const testBoard = [...boardState];
    testBoard[cellIndex] = symbol;
    
    const circuit = encodeBoard(testBoard);
    const features = extractQuantumFeatures(circuit);
    
    let score = 0;
    
    // Quantum-based scoring
    score += (4 - features.entropy) * 10;
    score += features.purity * 50;
    
    const cellInDominant = features.dominantStates.some(s => 
        (s.state % 9) === cellIndex
    );
    if (cellInDominant) {
        score += 30;
    }
    
    score += features.dominantStates[0].prob * 20;
    
    // Classical strategy bonuses
    if (cellIndex === 4) score += 15;
    if ([0, 2, 6, 8].includes(cellIndex)) score += 10;
    
    return { 
        score, 
        features: {
            entropy: features.entropy,
            purity: features.purity
        }
    };
}

function simulateQuantumMove(boardState = Array(9).fill(null)) {
    // AI always plays O
    const symbol = 'O';
    
    const moveAnalysis = [];
    
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        if (boardState[cellIndex] === null) {
            const { score, features } = scoreMove(boardState, cellIndex);
            
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
            measured: "Strategic choice based on quantum feature analysis",
            classicalRegister: chosenMove.cellIndex,
            probabilities: finalFeatures.probabilities.slice(0, 16),
            entropy: finalFeatures.entropy.toFixed(3),
            purity: finalFeatures.purity.toFixed(3),
            quantumState: `Analyzed ${moveAnalysis.length} moves, chose cell ${chosenMove.cellIndex} (score: ${chosenMove.score.toFixed(2)})`
        }
    };
}

module.exports = { simulateQuantumMove };