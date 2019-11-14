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
  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.addedNodes.length) {
        console.log('A child node has been added');
        console.log('the added node is: ', mutation.addedNodes);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  function addCheckBox(row) {
    var td = document.createElement('td');
    td.innerHTML = '<input type="checkbox" class="rowDisablerCheckBox">';

    row.prepend(td);
    console.log(row);
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
