export function getStorageState(key) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      resolve(result);
    })
  );
}

export function setStorageState(key, state) {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set({ [key]: state }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      resolve();
    })
  );
}

export async function updateStorageState(key, state) {
  const previousState = (await getStorageState(key))[key];
  const newState = { ...previousState, ...state };
  return setStorageState(key, newState);
}
export default { getStorageState, setStorageState, updateStorageState };
