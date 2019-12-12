console.log('table-row-locker: background script');

// utility functions
const urlToDomain = url => url.match(/^.*\/\/.+?\//)[0];

const disableExtension = tab => {
  console.log('Setting Disabled Browser Action State');
  const { id: tabId } = tab;

  // Update Context Menu
  chrome.contextMenus.update('enabledCheckbox', {
    title: `Enable on: ${urlToDomain(tab.url)}`,
    checked: false
  });

  // Enable left click browser action
  chrome.browserAction.enable(tabId);

  // Update Title
  chrome.browserAction.setTitle({
    tabId,
    title: `Table-Row-Locker v0.1.0  
Click to Enable!`
  });

  // Update Icon
  chrome.browserAction.setIcon({
    tabId,
    path: 'img/tableRowLockerDisabledIcon16.png'
  });

  // Set Badge text & color
  chrome.browserAction.setBadgeText({ text: '!', tabId });
  chrome.browserAction.setBadgeBackgroundColor({ color: '#F00', tabId });
};

const enableExtension = tab => {
  console.log('Setting Enabled Browser Action State');
  const { id: tabId } = tab;

  // Update Context Menu
  chrome.contextMenus.update('enabledCheckbox', {
    title: `Enable on: ${urlToDomain(tab.url)}`,
    checked: true
  });

  // Disable left click browser action
  chrome.browserAction.disable(tabId);

  // Update Title
  chrome.browserAction.setTitle({
    tabId,
    title: `Table-Row-Locker v0.1.0`
  });

  // Update Icon
  chrome.browserAction.setIcon({
    tabId,
    path: 'img/tableRowLockerIcon16.png'
  });
  chrome.browserAction.setBadgeText({ text: '', tabId });
};

chrome.contextMenus.create(
  {
    id: 'enabledCheckbox',
    contexts: ['browser_action'],
    title: `Enable`,
    type: 'checkbox',
    checked: false
  },
  () => {
    console.log(
      chrome.runtime.lastError
        ? `Error: ${chrome.runtime.lastError}`
        : `'Enable' contextMenu successfully created`
    );
  }
);
chrome.contextMenus.onClicked.addListener(({ checked }, tab) => {
  if (checked) {
    enableExtension(tab);
  } else {
    disableExtension(tab);
  }
});
const sendActivateMsg = tab =>
  chrome.tabs.sendMessage(tab.id, {
    type: 'Activate',
    storageKey: urlToDomain(tab.url)
  });
chrome.browserAction.onClicked.addListener(tab => {
  enableExtension(tab);
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
          enableExtension(tab);
          sendActivateMsg(tab);
        } else {
          // Storage not found disable and wait for browserAction click
          disableExtension(tab);
        }
      });

      break;
    default:
      console.log(`table-row-locker: unknown message type: ${type}`);
  }
});
