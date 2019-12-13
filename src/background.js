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
  } else {
    setBrowserActionView(false, tab);
  }
  setStorageState(domain, { isEnabled: checked });
});

chrome.browserAction.onClicked.addListener(tab => {
  const domain = urlToDomain(tab.url);
  setBrowserActionView(true, tab);
  setStorageState(domain, { isEnabled: true });
});
getStorageState(null).then(stores => {
  chrome.tabs.query({ status: 'complete' }, tabs => {
    tabs.forEach(tab => {
      const domain = urlToDomain(tab.url);
      if (stores[domain] && stores[domain].isEnabled) {
        console.log('SET ENABLED', domain);
        setBrowserActionView(true, tab);
      } else {
        console.log('SET DISABLED', domain);
        setBrowserActionView(false, tab);
      }
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changedInfo, tab) => {
  if (changedInfo.status === 'complete') {
    console.log('update complete');
    const domain = urlToDomain(tab.url);
    getStorageState(domain).then(store => {
      if (store[domain] && store[domain].isEnabled) {
        console.log('SET ENABLED', domain);
        setBrowserActionView(true, tab);
      } else {
        console.log('SET DISABLED', domain);
        setBrowserActionView(false, tab);
      }
    });
  }
});
