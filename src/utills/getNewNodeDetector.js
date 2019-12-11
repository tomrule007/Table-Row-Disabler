export default function getNewNodeDetector(
  elementToObserve,
  NodeNameToDetect,
  newNodeCallback
) {
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(
    // MutationObserver Callback
    mutationsList => {
      for (const mutation of mutationsList) {
        const newNodeCount = mutation.addedNodes.length;
        if (newNodeCount) {
          for (let i = 0; i < newNodeCount; i++) {
            const newNode = mutation.addedNodes[i];
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
  return observer;
}
