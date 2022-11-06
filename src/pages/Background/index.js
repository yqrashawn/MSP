import { listen } from './listener.js';
import { sideEffect, filter, map } from '@thi.ng/transducers';
import { partial } from '@thi.ng/compose';
import { trace } from '@thi.ng/rstream';
import { toService } from './ToServiceSubscriber.js';
import { tosub } from '../../util.js';
import { create as createNotification } from './notification.js';

import {
  cleanupTx,
  isValidTx,
  newTx,
  setTxResult,
  toNewTxRPC,
} from './../../db.js';
import { s } from './../../util.js';

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

const sendTxStream = s('sendTx');

const toSendTxStream = { next: sendTxStream.next.bind(sendTxStream) };

sendTxStream
  .transform(filter(isValidTx), map(cleanupTx))
  .transform(map(newTx), map(toNewTxRPC))
  .subscribe(toService('http://47.252.32.182:8080/hackathon/trade_check'))
  .subscribe(tosub(([id, result]) => setTxResult(id, result), '[setTxResult]'))
  .subscribe(
    tosub(([id]) => {
      return createNotification(
        location.href.replace('background.html', `popup.html?tx=${id}`)
      );
    })
  );

contentScriptStrem.transform(
  map(getData),
  filter(isFromMetaMask)
  // sideEffect(partial(logData, true))
);

contentScriptStrem.transform(
  map(getData),
  filter(isToMetaMask)
  // sideEffect(partial(logData, false))
);

// SENDTX
contentScriptStrem
  .transform(
    map(getData),
    filter(isFromMetaMask),
    filter(isSendTransaction)
    // sideEffect(partial(console.log, 'SENDTX:'))
  )
  .subscribe(toSendTxStream);
