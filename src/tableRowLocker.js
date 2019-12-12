import getNewNodeDetector from './utills/getNewNodeDetector';

let domObserverRef = null;

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

  // disconnect domObserverRef if it exists to allow garbage collection.
  if (domObserverRef) domObserverRef.disconnect();

  // Create newNodeDetector and set global reference.
  domObserverRef = getNewNodeDetector('TR', addLock, document.body);

  // Add lock's to all existing rows
  [...document.getElementsByTagName('tr')].forEach(addLock);

  function getUniqueRowIdentifier(row) {
    /* Currently hard coding this to the value of the first TD
    TODO: In future versions I would like the user to be able to set the column
          or columns of interest to identify a row for more flexible use cases. 
  */

    return row.cells[0].textContent;
  }
  function disableAllInputs(node, disable) {
    if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA')
      // eslint-disable-next-line no-param-reassign
      node.disabled = disable;

    // Recursively check all childNodes inputs.
    [...node.childNodes].forEach(childNode =>
      disableAllInputs(childNode, disable)
    );
  }
  function toggleLock(lockEl) {
    console.log('table-row-locker: row lock toggled!');
    const { rowId } = lockEl.dataset;
    const isLocked = !lockerStore.isRowLocked(rowId);
    // Toggle locked state
    lockEl.classList.toggle('lock');

    // Toggle Input disabled state
    const rowElement = lockEl.parentNode.parentNode;
    disableAllInputs(rowElement, isLocked);

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
    lockEl.addEventListener('click', () => toggleLock(lockEl));
    lockEl.classList.add('tableRowLocker');

    // Get rowID and store in dataset
    const rowId = getUniqueRowIdentifier(row);
    lockEl.dataset.rowId = rowId;

    // Sync element class with saved lock state
    if (lockerStore.isRowLocked(rowId)) {
      lockEl.classList.add('lock');
      disableAllInputs(row, true);
    } else {
      lockEl.classList.remove('lock');
    }

    /* Currently hard coding lock element location to first TD
    TODO: In future versions I would like the user to be able to set  which column
    the lock is element is located in. 
    */
    // Attach element to Row
    row.cells[0].prepend(lockEl);
  }
}

// Storage event listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  // Only listen to 'sync' namespace changes
  if (namespace !== 'sync') return;
  // hacky way to match the tab.url property which the background script reads
  const domain = window.location.origin + '/';
  Object.keys(changes).forEach(key => {
    if (key === domain) {
      // changes to this domain storage detected!
      const { newValue, oldValue } = changes[key];
      console.log({ newValue, oldValue });

      if (newValue && newValue.isEnabled) {
        if (!oldValue || !oldValue.isEnabled)
          console.log(`(${domain}) Initialize Script!`);
        console.log(`(${domain}) ScanRows`);
      } else if (oldValue && oldValue.isEnabled) {
        console.log(`(${domain}) Teardown Script!`);
      } else {
        console.log(`(${domain}) Do Nothing!!`);
      }
    }
  });
});
