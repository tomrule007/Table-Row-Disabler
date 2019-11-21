console.log('table-row-locker: background script');

// utility functions
const urlToDomain = url => url.match(/^.*\/\/.+?\//)[0];

// Setup message listener to communicate with content scripts.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const { type } = message;
  const { url, tab } = sender;
  console.log(`Received ${type}`);
  switch (type) {
    case 'sendDomainName':
      chrome.tabs.sendMessage(tab.id, {
        type: 'domainName',
        domainName: urlToDomain(url)
      });
      break;
    default:
      console.log(`table-row-locker: unknown message type: ${type}`);
  }
});
