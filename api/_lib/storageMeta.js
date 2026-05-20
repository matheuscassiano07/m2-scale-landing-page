'use strict';

/**
 * Estado do último acesso ao armazenamento (para o painel /admin).
 */
let state = {
  configured: false,
  supabaseOk: null,
  activeSource: 'file',
  lastError: '',
};

function setStorageState(patch) {
  state = Object.assign({}, state, patch);
}

function getStorageState() {
  return Object.assign({}, state);
}

function resetStorageState() {
  state = {
    configured: false,
    supabaseOk: null,
    activeSource: 'file',
    lastError: '',
  };
}

module.exports = {
  setStorageState: setStorageState,
  getStorageState: getStorageState,
  resetStorageState: resetStorageState,
};
