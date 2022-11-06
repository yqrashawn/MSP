import createV from 'zustand/vanilla';
import createR from 'zustand';
import { persist } from 'zustand/middleware';
import { isObject } from '@thi.ng/checks';

const persistOptions = { name: 'temp-local-storage' };

const create = location.href.match(/background\.html/) ? createV : createR;

export const useStore = create(
  persist(
    (set, get) => ({
      nextId: 1,
      getNextId() {
        const nextId = get().nextId;
        set({ nextId: nextId + 1 });
        return nextId;
      },

      txMap: {},

      newTx(tx) {
        const { getNextId, upsertTx } = get();
        const nextId = tx.data.id || getNextId();
        tx.data.id = nextId;
        return upsertTx(nextId, tx);
      },
      upsertTx(id, tx) {
        const { txMap } = get();
        const oldTx = txMap[id] || {};
        txMap[id] = { ...oldTx, ...tx };
        set({ txMap });
        return id;
      },
      setTxResult(id, result) {
        const tx = get().getTxById(id);
        if (!tx) return;
        tx.approvals = result;
        return get().upsertTx(id, tx);
      },
      getTxById(id) {
        const { txMap } = get();
        return txMap[id];
      },
    }),
    persistOptions
  )
);

export function useSingleTx(txId) {
  const { txMap } = useStore();
  return txMap[txId] || { data: {}, origin: '', result: {} };
}

const { getState, setState, subscribe, destroy } = useStore;

export const { newTx, getTxById } = getState();

export function toNewTxRPC(id) {
  const tx = getTxById(id);
  return { method: 'newTx', params: [tx], jsonrpc: '2.0', id };
}

export function setTxResult(id, result) {
  console.log(id, result);
  return getState().setTxResult(id, result);
}

export function cleanupTx(tx = {}) {
  const { data, origin } = tx;
  return { data, origin };
}

export function isValidTx(tx = {}) {
  return tx.origin && isObject(tx.data);
}
