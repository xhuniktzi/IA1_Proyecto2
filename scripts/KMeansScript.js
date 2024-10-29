let data = [];
let k = 3; // Número de clusters por defecto
let iterations = 100; // Número de iteraciones por defecto
let chart; // Variable para almacenar la instancia de Chart.js

// Función para leer archivos CSV
const readCSVKMeans = (file) => {
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

// Cargar archivo de datos
document
  .getElementById("data-file")
  .addEventListener("change", async (event) => {
    data = (await readCSVKMeans(event.target.files[0])).map((row) =>
      row.length === 1 ? row[0] : row
    );
    console.log("Datos cargados:", data);
  });

// Cargar archivo de configuración
document
  .getElementById("config-file")
  .addEventListener("change", async (event) => {
    const config = (await readCSVKMeans(event.target.files[0]))[0];
    k = config[0];
    iterations = config[1];
    console.log(`Configuración: Clusters: ${k}, Iteraciones: ${iterations}`);
  });

// Función para ejecutar clustering y graficar los resultados
document.getElementById("btnLineal").onclick = function () {
  if (data.length === 0 || k <= 0 || iterations <= 0) {
    alert("Por favor, carga los archivos de datos y configuración.");
    return;
  }

  // Ejecutar el clustering
  const is2D = Array.isArray(data[0]);
  const kmeans = is2D ? new _2DKMeans() : new LinearKMeans();
  let clustered_data = kmeans.clusterize(k, data, iterations);

  // Asignar colores a los clusters
  let clusters = Array.from(new Set(clustered_data.map((a) => a[1])));
  clusters = clusters.map((cluster) => [
    cluster,
    `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  ]);

  // Visualizar resultados
  drawChart(clustered_data, clusters, is2D);
};

function drawChart(clustered_data, clusters, is2D) {
  // Si ya existe un gráfico, destruirlo antes de crear uno nuevo
  if (chart) {
    chart.destroy();
  }

  // Preparar los datos para Chart.js
  const datasets = clusters.map(([cluster, color]) => {
    return {
      label: `Cluster ${cluster}`,
      data: clustered_data
        .filter(([point, clusterID]) => clusterID === cluster)
        .map(([point]) => ({
          x: is2D ? point[0] : point,
          y: is2D ? point[1] : 0,
        })),
      backgroundColor: color,
      pointRadius: 5,
    };
  });

  // Configuración del gráfico
  const ctx = document.getElementById("chartkmean").getContext("2d");
  chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: datasets,
    },
    options: {
      title: {
        display: true,
        text: "Clustering K-Means",
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "X",
          },
          min: Math.min(...data.flat()) - 10,
          max: Math.max(...data.flat()) + 10,
        },
        y: {
          title: {
            display: true,
            text: "Y",
          },
          min: is2D ? Math.min(...data.flat()) - 10 : -1,
          max: is2D ? Math.max(...data.flat()) + 10 : 1,
        },
      },
    },
  });
}
