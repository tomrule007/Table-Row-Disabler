console.log('table-row-locker: Injecting tableRowLocker...');
var s = document.createElement('script');
s.src = chrome.runtime.getURL('tableRowLocker.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
