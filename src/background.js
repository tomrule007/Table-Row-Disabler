console.log('table-row-locker: background script');

// utility functions
const urlToDomain = url => url.match(/^.*\/\/.+?\//)[0];

const sendActivateMsg = tab =>
  chrome.tabs.sendMessage(tab.id, {
    type: 'Activate',
    storageKey: urlToDomain(tab.url)
  });
const disableExtensionIcon = tab => {
  const { id } = tab;
  chrome.pageAction.show(id);
  chrome.pageAction.setTitle({
    tabId: id,
    title: `Table-Row-Locker v1.0.0  
Click to Enable!`
  });
  chrome.pageAction.setIcon({
    tabId: id,
    path: 'img/tableRowLockerDisabledIcon16.png'
  });
};

const enableExtensionIcon = tab => {
  const { id } = tab;
  chrome.pageAction.hide(id);
  chrome.pageAction.setTitle({ tabId: id, title: `Table-Row-Locker v1.0.0` });
  chrome.pageAction.setIcon({
    tabId: id,
    path: 'img/tableRowLockerIcon16.png'
  });
};
chrome.pageAction.onClicked.addListener(tab => {
  enableExtensionIcon(tab);
  sendActivateMsg(tab);
});
// Setup message listener to communicate with content scripts.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { type } = message;
  const { url, tab } = sender;
  console.log(`Received ${type}`);
  switch (type) {
    case 'requestActivation':
      const storageKey = urlToDomain(url);
      chrome.storage.sync.get([storageKey], results => {
        if (results[storageKey]) {
          // Storage found! send activation message with storageKey
          sendActivateMsg(tab);
        } else {
          // Storage not found disable and wait for pageAction click
          disableExtensionIcon(tab);
        }
      });

      break;
    default:
      console.log(`table-row-locker: unknown message type: ${type}`);
  }
});
