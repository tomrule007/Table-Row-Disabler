import getNewNodeDetector from './utills/getNewNodeDetector';
// Setup message listener to communicate with background script.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { type } = message;
  switch (type) {
    case 'Activate':
      console.log(`table-row-locker: Activating!`);
      const { storageKey } = message;
      chrome.storage.sync.get([storageKey], result => {
        loadTableRowLocker(result[storageKey] || {}, storageKey);
      });

      break;
    default:
      console.log(`table-row-locker: unknown message type: ${type}`);
  }
});

// Request Activation
chrome.runtime.sendMessage({ type: 'requestActivation' });

function loadTableRowLocker(initialState, storageKeyId) {
  console.log('table-row-locker: Loading...');
  const lockerStore = (function() {
    let store = initialState;

    const setState = state =>
      chrome.storage.sync.set({ [storageKeyId]: state });

    return {
      isRowLocked: rowId => store[rowId] || false,
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

  // Find all 'tbody' elements
  const tbodyElements = document.getElementsByTagName('tbody');
  console.log(
    `table-row-locker: ${tbodyElements ? tbodyElements.length : 0} tbody found'`
  );

  [...tbodyElements].forEach(tbody => {
    // Attach Mutation observer
    console.log('table-row-locker: Attaching observer to:', tbody);
    getNewNodeDetector(tbody, 'TR', addLock);

    // Add lock's to existing rows
    [...tbody.childNodes].forEach(childNode => {
      if (childNode.nodeName !== 'TR') return;
      addLock(childNode);
    });
  });

  function getUniqueRowIdentifier(row) {
    /* Currently hard coding this to the value of the first TD
    TODO: In future versions I would like the user to be able to set the column
          or columns of interest to identify a row for more flexible use cases. 
  */

    return row.cells[0].textContent;
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
    console.log('table-row-locker: row lock toggled!');
    // Get lockEl & rowId & new isLocked State
    const lockEl = event.target;
    const { rowId } = lockEl.dataset;
    const isLocked = !lockerStore.isRowLocked(rowId);
    // Toggle locked state
    lockEl.classList.toggle('lock');

    // Toggle Input disabled state
    const rowElement = lockEl.parentNode.parentNode;
    disableAndClearAllInputs(rowElement, isLocked);

    // Update locked state.
    lockerStore.setRow(rowId, isLocked);
  }

  function addLock(row) {
    // Exit if row has lock.
    if (row.dataset.tableRowLocker) return;
    // Tag row to prevent multiple locks.
    row.dataset.tableRowLocker = true;

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
    row.cells[0].prepend(lockEl);
  }
}
