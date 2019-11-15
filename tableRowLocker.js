(function() {
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

  function addCheckBox(row) {
    console.log('table-row-locker: Adding lock checkbox to row!');
    var div = document.createElement('div');
    div.dataset.rowId = getUniqueRowIdentifier(row);
    div.innerHTML = '<input type="checkbox" class="rowDisablerCheckBox">';
    row.prepend(div);
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
