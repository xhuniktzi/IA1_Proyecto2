// Elementos
const polyFileInput = document.querySelector("#polynomial--file");
const polyDegreeInput = document.querySelector("#polynomial-degree");
const polyFitBtn = document.querySelector("#polynomial--btn-fit");
const polyPredictBtn = document.querySelector("#polynomial--btn-predict");
const polyMSEBtn = document.querySelector("#polynomial--btn-mse");
const polyR2Btn = document.querySelector("#polynomial--btn-r2");

const polyFitResult = document.querySelector("#poly-fit-result");
const polyPredictResult = document.querySelector("#poly-predict-result");
const polyMSEResult = document.querySelector("#poly-mse-result");
const polyR2Result = document.querySelector("#poly-r2-result");

let polyXVars = [];
let polyYVars = [];
let polynomialInstance = new PolynomialRegression();
let polyPredict = [];

// Función para leer y procesar el archivo CSV
const readPolyCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const rows = data.split("\n").slice(1);
      const xData = [];
      const yData = [];

      rows.forEach((row) => {
        const [x, y] = row.split(",").map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          xData.push(x);
          yData.push(y);
        }
      });

      resolve({ xVars: xData, yVars: yData });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// Acción: Fit (ajustar el modelo)
const fitPolyModel = async () => {
  if (!polyFileInput.files.length || !polyDegreeInput.value) {
    polyFitResult.textContent =
      "Por favor selecciona un archivo CSV y el grado del polinomio.";
    return;
  }

  const degree = parseInt(polyDegreeInput.value);
  const data = await readPolyCSV(polyFileInput.files[0]);
  polyXVars = data.xVars;
  polyYVars = data.yVars;

  polynomialInstance.fit(polyXVars, polyYVars, degree);

  // Habilita el botón de predict una vez que se ha ajustado el modelo
  polyPredictBtn.disabled = false;
  polyFitResult.textContent = "Modelo polinomial ajustado correctamente.";
};

// Acción: Predict (predecir)
const predictPolyModel = () => {
  polyPredict = polynomialInstance.predict(polyXVars);

  // Habilita los botones de MSE y R2 una vez que se ha hecho la predicción
  polyMSEBtn.disabled = false;
  polyR2Btn.disabled = false;

  renderPolyChart();
  polyPredictResult.textContent = "Predicciones realizadas.";
};

// Acción: MSE (Error Cuadrático Medio)
const calculatePolyMSE = () => {
  const mse = polynomialInstance.getError();
  polyMSEResult.textContent = `El MSE del modelo es: ${mse.toFixed(4)}`;
};

// Acción: Coeficiente R2
const calculatePolyR2 = () => {
  const r2 = polynomialInstance.getError();
  polyR2Result.textContent = `El Coeficiente R2 del modelo es: ${r2.toFixed(
    4
  )}`;
};
// Variable para almacenar la instancia del gráfico
let polyChart;

// Función para renderizar el gráfico polinomial
const renderPolyChart = () => {
  const polyLineData = polyXVars.map((x, index) => ({
    x,
    y: polyPredict[index],
  }));
  const polyPointData = polyXVars.map((x, index) => ({
    x,
    y: polyYVars[index],
  }));

  const ctx = document.querySelector("#polynomial--canva").getContext("2d");

  // Destruir el gráfico existente si ya existe
  if (polyChart) {
    polyChart.destroy();
  }

  // Crear un nuevo gráfico y almacenarlo en polyChart
  polyChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Regresión Polinomial",
          data: polyLineData,
          type: "line",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Datos Originales",
          data: polyPointData,
          backgroundColor: "rgba(255, 99, 132, 1)",
          pointRadius: 5,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
};

// Event listeners
polyFitBtn.addEventListener("click", fitPolyModel);
polyPredictBtn.addEventListener("click", predictPolyModel);
polyMSEBtn.addEventListener("click", calculatePolyMSE);
polyR2Btn.addEventListener("click", calculatePolyR2);
