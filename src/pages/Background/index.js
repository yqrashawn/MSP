import { listen } from './listener.js';
import { sideEffect, filter, map } from '@thi.ng/transducers';
import { partial } from '@thi.ng/compose';

const { contentScriptStrem } = listen();

function getData([data, post]) {
  return data;
}

function isFromMetaMask({ fromMetaMask }) {
  return fromMetaMask;
}

function isToMetaMask({ toMetaMask }) {
  return toMetaMask;
}

function isSendTransaction({ data }) {
  return data.method === 'eth_sendTransaction';
}

function logData(fromMetaMask, data) {
  console.log(fromMetaMask ? 'FROM MM:' : 'TO MM:', data);
}

contentScriptStrem.transform(
  map(getData),
  filter(isFromMetaMask),
  sideEffect(partial(logData, true))
);

contentScriptStrem.transform(
  map(getData),
  filter(isToMetaMask),
  sideEffect(partial(logData, false))
);

contentScriptStrem.transform(
  map(getData),
  filter(isFromMetaMask),
  filter(isSendTransaction),
  sideEffect(partial(console.log, 'SENDTX:'))
);
