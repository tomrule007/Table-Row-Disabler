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
  row.innerHTML = `<tr><td>${label} Date, Medjool 24x1#</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td style="width: 15%;"></td><td style="width: 15%;"></td><td><textarea tabindex="-1" type="text" style="width: 100%; resize: vertical; padding: 3px; height: 24px;"></textarea></td><td><input pattern="[0-9]*" inputmode="numeric" value="" style="width: 50px;"></td></tr>`;

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
