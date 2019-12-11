export default function getNewNodeDetector(
  nodeNameToDetect,
  callback,
  nodeToObserve,
  MutationObserverOptions = {
    attributes: false,
    childList: true,
    subtree: true
  }
) {
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(
    // MutationObserver Callback
    mutationsList => {
      Object.values(mutationsList).forEach(mutation => {
        Object.values(mutation.addedNodes).forEach(addedNode => {
          if (addedNode.nodeName === nodeNameToDetect) {
            console.log(`table-row-locker: New ${nodeNameToDetect} detected!`);
            callback(addedNode);
          }
        });
      });
    }
  );

  // Start observing
  observer.observe(nodeToObserve, MutationObserverOptions);
  return observer;
}
