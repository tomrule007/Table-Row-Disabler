import { version } from '../package.json';
import { getStorageState, updateStorageState } from './utills/extensionStore';

// Makes tab.url === window.location.origin + '/' (which the content script relies on)
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

const setExtensionOn = (setOn, tab) => {
  const domain = urlToDomain(tab.url);
  setBrowserActionView(setOn, tab);
  updateStorageState(domain, { isEnabled: setOn });
};

const getStoreAndTriggerViewUpdate = tab => {
  const domain = urlToDomain(tab.url);
  getStorageState(domain).then(store => {
    if (store[domain] && store[domain].isEnabled) {
      setBrowserActionView(true, tab);
    } else {
      setBrowserActionView(false, tab);
    }
  });
};

// Initialize Current tabs
chrome.tabs.query({ status: 'complete' }, tabs => {
  tabs.forEach(getStoreAndTriggerViewUpdate);
});

// Tab Change Listeners
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === -1) return;
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) =>
    getStoreAndTriggerViewUpdate(tab)
  );
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, getStoreAndTriggerViewUpdate);
});

chrome.tabs.onUpdated.addListener((tabId, changedInfo, tab) => {
  if (changedInfo.status !== 'complete') return;
  getStoreAndTriggerViewUpdate(tab);
});

// Set Enabled on browser action click
chrome.browserAction.onClicked.addListener(tab => setExtensionOn(true, tab));

// Toggle Extension on/off on contextMenu click
chrome.contextMenus.onClicked.addListener(({ checked }, tab) =>
  setExtensionOn(checked, tab)
);
