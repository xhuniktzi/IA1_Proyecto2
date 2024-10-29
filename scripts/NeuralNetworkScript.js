// Variables globales para almacenar los datos cargados
let networkConfig = [];
let networkTrainingData = [];
let networkPredictionData = [];

// Función para leer archivos CSV
const readCSVNetwork = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const rows = data
        .trim()
        .split("\n")
        .map((row) => row.split(",").map(Number));
      resolve(rows);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// Cargar configuración de red
document
  .getElementById("network-config-file")
  .addEventListener("change", async (event) => {
    networkConfig = (await readCSVNetwork(event.target.files[0]))[0];
    console.log("Configuración de la red:", networkConfig);
  });

// Cargar datos de entrenamiento
document
  .getElementById("training-data-file")
  .addEventListener("change", async (event) => {
    networkTrainingData = await readCSVNetwork(event.target.files[0]);
    console.log("Datos de entrenamiento:", networkTrainingData);
  });

// Cargar datos de predicción
document
  .getElementById("prediction-data-file")
  .addEventListener("change", async (event) => {
    networkPredictionData = await readCSVNetwork(event.target.files[0]);
    console.log("Datos de predicción:", networkPredictionData);
  });

// Función para entrenar y predecir
document.getElementById("train-and-predict-btn").onclick = function () {
  if (
    networkConfig.length === 0 ||
    networkTrainingData.length === 0 ||
    networkPredictionData.length === 0
  ) {
    alert(
      "Por favor, carga todos los archivos CSV antes de entrenar y predecir."
    );
    return;
  }

  // Crear la red neuronal con la configuración cargada
  let redNeural = new NeuralNetwork(networkConfig);

  // Entrenar la red neuronal con los datos de entrenamiento
  networkTrainingData.forEach((row) => {
    const inputs = row.slice(0, networkConfig[0]); // Entradas según configuración
    const targets = row.slice(networkConfig[0]); // Salidas esperadas
    redNeural.Entrenar(inputs, targets);
  });

  // Realizar predicciones con los datos de predicción
  let predictions = networkPredictionData.map((inputs) => redNeural.Predecir(inputs));

  // Mostrar los resultados
  document.getElementById("nnresultado").innerHTML = predictions
    .map(
      (pred, index) =>
        `Predicción ${index + 1}: [${pred.map((p) => p.toFixed(2)).join(", ")}]`
    )
    .join("<br>");
};
