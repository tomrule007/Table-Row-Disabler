// Global Variables
// Reads stored rowCount (null is coerced into 0)
var rowCount = Number(localStorage.getItem('rowCount'));
var rowInterval;

// Event Listeners
document
  .getElementById('addRow')
  .addEventListener('click', addRowAndUpdateCount);
document.getElementById('addInterval').addEventListener('click', addInterval);

document.getElementById('stopInterval').addEventListener('click', stopInterval);
document
  .getElementById('clearTable')
  .addEventListener('click', clearTableAndResetCount);

// HTML Elements
const tbody = document.getElementById('tbody');

const intervalTime = document.getElementById('intervalTime');

// Initialize previous set rows.
for (let i = 0; i < rowCount; i++) {
  addRow(i);
}
// Functions
function addRowAndUpdateCount() {
  console.log('add row and update count');
  addRow(rowCount++);
  localStorage.setItem('rowCount', rowCount);
}

function clearTableAndResetCount() {
  rowCount = 0;
  localStorage.setItem('rowCount', 0);
  tbody.innerHTML = '';
}

function addRow(label) {
  console.log('addRow!');
  var row = document.createElement('tr');
  row.innerHTML = `<td>${label}</td><td> Blah Blah Blah </td> <td><input type="text"></td>`;

  tbody.appendChild(row);
}
function stopInterval() {
  clearInterval(rowInterval);
}
function addInterval() {
  console.log(+intervalTime.value);
  // check and clear old interval first
  if (rowInterval) clearInterval(rowInterval);
  rowInterval = setInterval(() => {
    addRowAndUpdateCount();
  }, +intervalTime.value);
}
