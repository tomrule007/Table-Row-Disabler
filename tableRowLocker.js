// Find all 'tbody' elements
const tbodyElements = document.getElementsByTagName('tbody');

// Attach Mutation observer to each 'tbody' elements
[...tbodyElements].forEach(tbody =>
  getNewNodeDetector(tbody, 'TR', addCheckBox)
);

var lockerStore = (function() {
  /* currently using local store as an individual user solution. 
    TODO: need to figure out were the saved state will live for sharing between multiple users 
      1) backend database w/ auth accounts
      2) config file that is manual loaded (ie emailed back and forth)
      3) network shared config file that is auto loaded every time.
        
      (leaning to #3 as the cleanest answer with the least security implications)

    TODO: Also need domain specific storage & possibly table ID specific as well
  */

  let storeKeyId = 'tableRowLockerStore';
  let store = JSON.parse(localStorage.getItem(storeKeyId)) || {};
  const setState = state =>
    localStorage.setItem(storeKeyId, JSON.stringify(state));

  return {
    isRowLocked: rowId => {
      console.log(store);
      var storeLookup = store[rowId];
      console.log(rowId, storeLookup);
      return storeLookup || false;
    },
    setRow: (rowId, isLocked) => {
      // Only store locked row keys and delete all unlocked row keys if state changed.
      if (isLocked) {
        store = { ...store, [rowId]: true };
      } else if (store[rowId]) {
        delete store[rowId];
      }
      setState(store);
    }
  };
})();

console.log('table-row-locker: tableRowLocker Injected!');
var tables = document.getElementsByTagName('table');
console.log('tables.length: ', tables.length);

var tableRows = document.getElementsByTagName('tr');
console.log('tablerows.length', tableRows.length);

[...tableRows].forEach(row => addCheckBox(row));

function getNewNodeDetector(
  elementToObserve,
  NodeNameToDetect,
  newNodeCallback
) {
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(
    // MutationObserver Callback
    mutationsList => {
      for (let mutation of mutationsList) {
        let newNodeCount = mutation.addedNodes.length;
        if (newNodeCount) {
          for (let i = 0; i < newNodeCount; i++) {
            let newNode = mutation.addedNodes[i];
            if (newNode.nodeName === NodeNameToDetect) {
              console.log(
                `table-row-locker: New ${NodeNameToDetect} detected!`
              );
              newNodeCallback(newNode);
            }
          }
        }
      }
    }
  );

  // Start observing
  observer.observe(elementToObserve, {
    attributes: false,
    childList: true,
    subtree: false
  });
  console.log(`table-row-locker: Observing ${elementToObserve}`);
  return observer;
}

function getUniqueRowIdentifier(row) {
  /* Currently hard coding this to the value of the first TD
    TODO: In future versions I would like the user to be able to set the column
          or columns of interest to identify a row for more flexible use cases. 
  */

  return row.firstChild.innerHTML;
}
function disableAndClearAllInputs(node, disable) {
  if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
    if (disable) node.value = '';
    node.disabled = disable;
  }

  // Check for children nodes and recursively check them for inputs as well.
  if (node.childNodes.length) {
    [...node.childNodes].forEach(childNode =>
      disableAndClearAllInputs(childNode, disable)
    );
  }
}
function rowLockerClickHandler(event) {
  console.log('table-row-locker: Locker clicked!');
  // Get lockEl & rowId & new isLocked State
  const lockEl = event.target;
  const rowId = lockEl.dataset.rowId;
  const isLocked = !lockerStore.isRowLocked(rowId);
  // Toggle locked state
  lockEl.classList.toggle('lock');

  // Toggle Input disabled state
  const rowElement = lockEl.parentNode.parentNode;
  disableAndClearAllInputs(rowElement, isLocked);

  // Update locked state.
  lockerStore.setRow(rowId, isLocked);
}

function addCheckBox(row) {
  // Create element & add event listener & set class
  const lockEl = document.createElement('span');
  lockEl.addEventListener('click', rowLockerClickHandler);
  lockEl.classList.add('tableRowLocker');

  // Get rowID and store in dataset
  const rowId = getUniqueRowIdentifier(row);
  lockEl.dataset.rowId = rowId;

  // Sync element class with saved lock state
  if (lockerStore.isRowLocked(rowId)) {
    lockEl.classList.add('lock');
    disableAndClearAllInputs(row, true);
  } else {
    lockEl.classList.remove('lock');
  }

  // Attach element to Row
  row.firstChild.prepend(lockEl);
}

function disableRow({ target }) {
  // Do nothing if the checkbox is not our own.
  if (target.dataset.rowDisabler !== 'rowDisabler') return;
  setStyle;
}

function getRowNode(el) {
  const MAX_DEPTH = 5;
  let rowNode;
  let curEl = el;
  for (let i = 0; i < MAX_DEPTH; i++) {
    if (curEl && curEl.tagName === 'TR') {
      rowNode = curEl;
      break;
    }
    curEl && (curEl = curEl.parentNode);
    if (MAX_DEPTH === i + 1)
      console.log(
        'table-row-locker: Unable to find Row Element. Increase MAX_DEPTH'
      );
  }
  return rowNode;
}
function setStyle(el, style) {
  el && (el.style.cssText = style);
}
