(function() {
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

  // Mutation Observer Example
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('tbody');

  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false };

  // Callback function to execute when mutations are observed
  const mutationCallback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      let newNodeCount = mutation.addedNodes.length;
      if (newNodeCount) {
        console.log('A child node has been added');
        for (let i = 0; i < newNodeCount; i++) {
          let newNode = mutation.addedNodes[i];
          if ((newNode.nodeName = 'TR')) {
            console.log('table-row-locker: new table row detected!');
            addCheckBox(newNode);
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(mutationCallback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  function getUniqueRowIdentifier(row) {
    /* Currently hard coding this to the value of the first TD
    TODO: In future versions I would like the user to be able to set the column
          or columns of interest to identify a row for more flexible use cases. 
  */

    return row.firstChild.innerHTML;
  }

  function rowLockerClickHandler(event) {
    console.log('table-row-locker: Locker clicked!');
    const lockerDiv = event.target;
    const rowId = lockerDiv.dataset.rowId;
    const isLocked = lockerDiv.dataset.isLocked === 'true';
    // If isLocked then set to unlocked else set to locked
    lockerDiv.innerHTML = isLocked ? '🔓Unlocked' : '🔒Locked';

    // Update locked state.
    lockerDiv.dataset.isLocked = !isLocked;
    lockerStore.setRow(rowId, !isLocked);
  }
  function addCheckBox(row) {
    const td = document.createElement('td');
    const rowId = getUniqueRowIdentifier(row);
    const isLocked = lockerStore.isRowLocked(rowId);

    td.dataset.rowId = rowId;
    td.dataset.isLocked = isLocked;
    td.innerHTML = isLocked ? '🔒Locked' : '🔓Unlocked';
    td.addEventListener('click', rowLockerClickHandler);
    row.prepend(td);
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
})();
