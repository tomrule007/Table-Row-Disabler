export function getStorageState(domain) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(domain, result => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      resolve(result);
    })
  );
}

export function setStorageState(domain, state) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set({ [domain]: state }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      console.log('State Set', `${domain}: `, state);
      resolve();
    })
  );
}

// export async function updateStorageState(domain, data) {
//     const previousState = await getStorageState(domain,);

//   return new Promise(resolve =>
//     chrome.storage.sync.set({ [storageKeyId]: state }, resolve());
//     chrome.storage.sync.get(key, result => resolve(result))
//   );
// }
export default { getStorageState, setStorageState };
