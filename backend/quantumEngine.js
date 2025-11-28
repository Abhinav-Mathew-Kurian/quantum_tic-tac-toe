const QuantumCircuit = require("quantum-circuit");

function simulateQuantumMove() {
    // 2-qubit quantum circuit
    const circuit = new QuantumCircuit(2);

    // Put both qubits in superposition
    circuit.addGate("h", -1, 0);
    circuit.addGate("h", -1, 1);

    // Entangle them
    circuit.addGate("cx", -1, [0, 1]);

    // Measurements
    circuit.addMeasure(0, "c", 0);
    circuit.addMeasure(1, "c", 1);

    // Run quantum circuit
    circuit.run();

    // Classical register (0–3)
    const creg = circuit.getCregValue("c");

    // Map 0–3 into 0–2 (qutrit space)
    const qutritState = creg % 3;

    // Map qutrit to board symbol
    const symbols = ["EMPTY", "X", "O"];
    const boardSymbol = symbols[qutritState];

    return {
        chosenState: qutritState,     // 0=empty, 1=X, 2=O
        boardSymbol: boardSymbol,     // "EMPTY", "X", "O"
        rawQuantumResult: {
            measured: creg.toString(2).padStart(2, "0"),
            classicalRegister: creg,
            qutritMapped: qutritState,
            symbol: boardSymbol,
            probabilities: circuit.probabilities(),
            quantumState: "Collapsed to qutrit: " + qutritState
        }
    };
}

module.exports = { simulateQuantumMove };
