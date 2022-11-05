import browser from 'webextension-polyfill';
import { stream, CloseMode, trace } from '@thi.ng/rstream';

import '../../assets/img/icon-34.png';
import '../../assets/img/icon-128.png';

const contentScriptStrem = stream({
  id: 'from-content-script',
  closeIn: CloseMode.NEVER,
  closeOut: CloseMode.NEVER,
  cache: true,
});

// debug
// contentScriptStrem.subscribe(trace());

function postMessage(port, msg) {
  try {
    port.postMessage();
  } catch (err) {
    if (err.message?.includes('object could not be cloned')) {
      msg = JSON.parse(JSON.stringify(msg));
      port.postMessage(msg);
    } else {
      console.error('[BACKGROUND postMessage]', err);
    }
  }
}

function onConnect(port) {
  const post = (msg) => postMessage(port, msg);
  if (port.name === 'content-script') {
    port.onMessage.addListener((msg) =>
      contentScriptStrem.next.call(contentScriptStrem, [msg, post])
    );
  }
}

export function listen() {
  browser.runtime.onConnect.addListener(onConnect);
  return { contentScriptStrem };
}
