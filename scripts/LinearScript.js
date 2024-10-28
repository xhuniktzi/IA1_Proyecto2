// Elementos
const fileInput = document.querySelector("#linear--file");
const fitBtn = document.querySelector("#linear--btn-fit");
const predictBtn = document.querySelector("#linear--btn-predict");
const mseBtn = document.querySelector("#linear--btn-mse");
const r2Btn = document.querySelector("#linear--btn-r2");

let xVars = [];
let yVars = [];
let linearInstance = new LinearRegression();
let predict = [];

// Función para leer y procesar el archivo CSV
const readCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const rows = data.split("\n").slice(1); // Divide en líneas y descarta la cabecera
      const xData = [];
      const yData = [];

      // Procesa cada fila del CSV
      rows.forEach((row) => {
        const [x, y] = row.split(",").map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          // Filtra filas no numéricas
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
const fitModel = async () => {
  if (!fileInput.files.length) {
    alert("Por favor selecciona un archivo CSV.");
    return;
  }

  const data = await readCSV(fileInput.files[0]);
  xVars = data.xVars;
  yVars = data.yVars;

  linearInstance.fit(xVars, yVars);

  // Habilita el botón de predict una vez que se ha ajustado el modelo
  predictBtn.disabled = false;
  alert("Modelo ajustado correctamente.");
};

// Acción: Predict (predecir)
const predictModel = () => {
  predict = linearInstance.predict(xVars);

  // Habilita los botones de MSE y R2 una vez que se ha hecho la predicción
  mseBtn.disabled = false;
  r2Btn.disabled = false;

  // Visualiza la predicción
  renderChart();
  alert("Predicciones realizadas.");
};

// Acción: MSE (Error Cuadrático Medio)
const calculateMSE = () => {
  const mse = linearInstance.mserror(yVars, predict);
  alert(`El MSE del modelo es: ${mse}`);
};

// Acción: Coeficiente R2
const calculateR2 = () => {
  const r2 = linearInstance.coeficientR2(yVars, predict);
  alert(`El Coeficiente R2 del modelo es: ${r2}`);
};

// Función para renderizar el gráfico
const renderChart = () => {
  const lineData = xVars.map((x, index) => ({ x, y: predict[index] }));
  const pointData = xVars.map((x, index) => ({ x, y: yVars[index] }));

  const ctx = document.querySelector("#linear--canva").getContext("2d");
  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Regresión Lineal",
          data: lineData,
          type: "line",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Datos Originales",
          data: pointData,
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
fitBtn.addEventListener("click", fitModel);
predictBtn.addEventListener("click", predictModel);
mseBtn.addEventListener("click", calculateMSE);
r2Btn.addEventListener("click", calculateR2);
