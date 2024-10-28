let datos = []; // Almacena los datos del CSV
let columnas = []; // Almacena los nombres de las columnas

// Función para leer el archivo CSV
const readCSVBayes = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const rows = data
        .trim()
        .split("\n")
        .map((row) => row.split(","));
      resolve(rows);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// Función para cargar los datos del CSV al HTML y generar campos de entrada para predicción
const loadData = async () => {
  const file = document.getElementById("data-file").files[0];
  if (!file) {
    alert("Por favor selecciona un archivo CSV.");
    return;
  }

  const rows = await readCSVBayes(file);
  columnas = rows[0]; // Cabecera con los nombres de las columnas

  // Generar automáticamente campos de entrada para cada columna, excepto la última (resultado)
  const inputFields = document.getElementById("input-fields");
  inputFields.innerHTML = "";
  for (let i = 0; i < columnas.length - 1; i++) {
    const label = document.createElement("label");
    label.textContent = `Valor para ${columnas[i]}:`;
    const input = document.createElement("input");
    input.type = "number";
    input.id = `input-${columnas[i]}`;
    inputFields.appendChild(label);
    inputFields.appendChild(input);
  }

  // Procesar las filas y guardarlas en `datos`
  datos = rows.slice(1).map((row) => {
    const atributos = row.slice(0, -1).map(Number); // convierte cada dato a número si es posible
    const resultado = row[row.length - 1];
    return { atributos, resultado };
  });

  displayTable(rows);
};

// Función para mostrar la tabla cargada en el HTML
const displayTable = (rows) => {
  let content = `<thead><tr>`;
  rows[0].forEach((col) => (content += `<th>${col}</th>`));
  content += `</tr></thead><tbody>`;

  rows.slice(1).forEach((row) => {
    content += `<tr>`;
    row.forEach((cell) => (content += `<td>${cell}</td>`));
    content += `</tr>`;
  });
  content += `</tbody>`;

  document.getElementById("tabla").innerHTML = content;
};

// Función para realizar predicción con Naive Bayes
document.getElementById("bayes--btn").onclick = () => {
  const naiveBayes = new NaiveBayes();

  // Insertar causas en el modelo
  columnas.slice(0, -1).forEach((col, index) => {
    const causaData = datos.map((row) => row.atributos[index]);
    naiveBayes.insertCause(col, causaData);
  });

  // Verificar que el último elemento de `columnas` existe en el modelo
  const effectName = columnas[columnas.length - 1];
  if (!naiveBayes.getCauseByName(effectName)) {
    console.error(`El efecto "${effectName}" no se encontró en el modelo.`);
    alert(
      `El efecto "${effectName}" no se encontró en el modelo. Verifica los datos.`
    );
    return;
  }

  // Obtener el valor de predicción para cada entrada
  const inputValues = columnas.slice(0, -1).map((col) => {
    const input = document.getElementById(`input-${col}`);
    return [col, Number(input.value)];
  });

  // Realizar la predicción
  const prediction = naiveBayes.predict(effectName, inputValues);

  // Mostrar la predicción
  let content2 = `<thead><tr><th>Predicción</th><th>Probabilidad</th></tr></thead><tbody>`;
  content2 += `<tr><td>${prediction[0]}</td><td>${prediction[1]}</td></tr>`;
  content2 += `</tbody>`;
  document.getElementById("tabla2").innerHTML = content2;
};

// Cargar los datos al presionar el botón de cargar archivo
document.getElementById("data-file").addEventListener("change", loadData);
