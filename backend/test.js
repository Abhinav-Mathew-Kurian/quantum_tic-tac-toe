

const QuantumCircuit = require("quantum-circuit");

function simulateQuantumMove() {
    // Create a 2-qubit quantum circuit
    const circuit = new QuantumCircuit(2);

    // Add Hadamard gates for superposition
    circuit.addGate("h", -1, 0);
    circuit.addGate("h", -1, 1);

    // Add CNOT gate for entanglement
    circuit.addGate("cx", -1, [0, 1]);

    // Measure both qubits
    circuit.addMeasure(0, "c", 0);
    circuit.addMeasure(1, "c", 1);

    // Run the circuit
    circuit.run();

    // Get measurement results
    const creg = circuit.getCregValue("c");
    
    // Convert measurement to cell position (0-8)
    const chosenCell = creg % 9;

    return {
        chosenCell: chosenCell,
        rawQuantumResult: {
            measured: creg.toString(2).padStart(2, '0'),
            classicalRegister: creg,
            probabilities: circuit.probabilities(),
            quantumState: "Superposition collapsed to: " + creg
        }
    };
}

module.exports = { simulateQuantumMove };
