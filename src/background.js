import { version } from '../package.json';
import { getStorageState, setStorageState } from './utills/extensionStore';

console.log('table-row-locker: background script');

// utility functions
const urlToDomain = url => {
  const domain = url.match(/(^.*)\/\/.+?\//);
  if (domain[1] === 'file:/') return 'file:///';
  return domain[0];
};

chrome.contextMenus.create({
  id: 'enabledCheckbox',
  contexts: ['browser_action'],
  title: `Enable`,
  type: 'checkbox',
  checked: false
});
const setBrowserActionView = (setEnabled, tab) => {
  const { id: tabId } = tab;

  chrome.contextMenus.update('enabledCheckbox', {
    title: `Enable on: ${urlToDomain(tab.url)}`,
    checked: setEnabled
  });

  const {
    enable,
    disable,
    setTitle,
    setIcon,
    setBadgeText,
    setBadgeBackgroundColor
  } = chrome.browserAction;

  if (setEnabled) {
    disable(tabId);
  } else {
    enable(tabId);
  }

  setTitle({
    tabId,
    title: `Table-Row-Locker v${version} ${
      setEnabled ? '' : '\nClick to Enable!'
    }`
  });

  setIcon({
    tabId,
    path: setEnabled
      ? 'img/tableRowLockerIcon16.png'
      : 'img/tableRowLockerDisabledIcon16.png'
  });

  // Set Badge text & color
  setBadgeText({ text: setEnabled ? '' : '!', tabId });
  if (!setEnabled) setBadgeBackgroundColor({ color: '#F00', tabId });
};

chrome.contextMenus.onClicked.addListener(({ checked }, tab) => {
  const domain = urlToDomain(tab.url);
  if (checked) {
    setBrowserActionView(true, tab);
    sendActivateMsg(tab);
  } else {
    setBrowserActionView(false, tab);
  }
  setStorageState(domain, { isEnabled: checked });
});
const sendActivateMsg = tab =>
  chrome.tabs.sendMessage(tab.id, {
    type: 'Activate',
    storageKey: urlToDomain(tab.url)
  });
chrome.browserAction.onClicked.addListener(tab => {
  const domain = urlToDomain(tab.url);
  setBrowserActionView(true, tab);
  setStorageState(domain, { isEnabled: true });
});
// Setup message listener to communicate with content scripts.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { type } = message;
  const { url, tab } = sender;
  const domain = urlToDomain(url);

  console.log(`Received ${type}`);
  switch (type) {
    case 'requestActivation':
      getStorageState(domain).then(results => {
        const store = results[domain];
        if (store) {
          // Storage found! send activation message with domain
          setBrowserActionView(true, tab);
          sendActivateMsg(tab);
        } else {
          // Store not found
          setStorageState(domain, { isEnabled: false });

          // Storage not found disable and wait for browserAction click
          setBrowserActionView(false, tab);
        }
      });

      break;
    default:
      console.log(`table-row-locker: unknown message type: ${type}`);
  }
});
