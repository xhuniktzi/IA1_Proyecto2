// Variables para almacenar los datos del CSV
let trainingData = [];
let predictionData = [];

// Función para leer un archivo CSV
const readCSVID3 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const rows = data.trim().split("\n").map(row => row.split(","));
            resolve(rows);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

// Función para cargar los datos de entrenamiento
const loadTrainingData = async () => {
    const file = document.getElementById("training-file").files[0];
    if (!file) {
        alert("Por favor selecciona un archivo CSV de entrenamiento.");
        return;
    }
    trainingData = await readCSVID3(file);
};

// Función para cargar los datos de predicción (opcional)
const loadPredictionData = async () => {
    const file = document.getElementById("predict-file").files[0];
    if (file) {
        predictionData = await readCSVID3(file);
    }
};

// Función para generar el árbol y realizar la predicción
const generatechart = () => {
    if (trainingData.length === 0) {
        alert("Por favor carga los datos de entrenamiento antes de generar el árbol.");
        return;
    }

    // Crear el árbol de decisión ID3 con los datos de entrenamiento
    const dTree = new DecisionTreeID3(trainingData);
    const root = dTree.train(dTree.dataset);

    // Configurar los datos para la predicción si existen
    let predict = null;
    if (predictionData.length > 0) {
        const predHeader = trainingData[0].slice(0, -1); // Excluye la última columna de la cabecera
        predict = dTree.predict([predHeader, predictionData[0]], root);
    }

    return {
        dotStr: dTree.generateDotString(root),
        predictNode: predict
    };
};

// Visualiza el árbol y muestra la predicción
document.getElementById('predict').onclick = async () => {
    await loadPredictionData(); // Carga el archivo de predicción
    const chart = document.getElementById("treed");
    const { dotStr, predictNode } = generatechart();

    if (predictNode != null) {
        const header = trainingData[0];
        document.getElementById('prediction').innerText = `${header[header.length - 1]}: ${predictNode.value}`;
    } else {
        document.getElementById('prediction').innerText = "No hay predicción disponible.";
    }

    const parsDot = vis.network.convertDot(dotStr);
    const data = {
        nodes: parsDot.nodes,
        edges: parsDot.edges
    };

    const options = {
        layout: {
            hierarchical: {
                levelSeparation: 100,
                nodeSpacing: 100,
                parentCentralization: true,
                direction: 'UD',
                sortMethod: 'directed'
            }
        }
    };

    new vis.Network(chart, data, options);
};

document.getElementById('btngenerate').onclick = async () => {
    await loadTrainingData(); // Carga el archivo de entrenamiento
    const chart = document.getElementById("treed");
    const { dotStr, predictNode } = generatechart();

    if (predictNode != null) {
        const header = trainingData[0];
        document.getElementById('prediction').innerText = `${header[header.length - 1]}: ${predictNode.value}`;
    } else {
        document.getElementById('prediction').innerText = "No hay predicción disponible.";
    }

    const parsDot = vis.network.convertDot(dotStr);
    const data = {
        nodes: parsDot.nodes,
        edges: parsDot.edges
    };

    const options = {
        layout: {
            hierarchical: {
                levelSeparation: 100,
                nodeSpacing: 100,
                parentCentralization: true,
                direction: 'UD',
                sortMethod: 'directed'
            }
        }
    };

    new vis.Network(chart, data, options);
};
