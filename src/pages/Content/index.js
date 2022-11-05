import browser from 'webextension-polyfill';
import { stream, CloseMode } from '@thi.ng/rstream';
import { sideEffect, filter, map } from '@thi.ng/transducers';
import { getSiteMetadata } from '@fluent-wallet/site-metadata';

function error(...msg) {
  console.log('[SUBSCRIBER ERROR] =>', ...msg);
}

const s = stream({
  id: 'message-listener',
  closeIn: CloseMode.NEVER,
  closeOut: CloseMode.NEVER,
  cache: true,
});

function isSameOrigin(msg) {
  return msg?.origin === location.origin;
}

function isToMetaMask(msg) {
  return (
    msg?.data?.target === 'metamask-contentscript' &&
    msg.data?.data?.name === 'metamask-provider'
  );
}

function isFromMetaMask(msg) {
  return (
    msg?.data?.target === 'metamask-inpage' &&
    msg.data?.data?.name === 'metamask-provider'
  );
}

function isRelatedToMetaMask(msg) {
  return isFromMetaMask(msg) || isToMetaMask(msg);
}

function isRPCCall(msg) {
  return msg.data.data?.data?.method;
}

function getMessageData(msg) {
  const { data } = msg.data.data;
  return {
    origin: msg.origin,
    data,
    fromMetaMask: msg.data.target === 'metamask-contentscript',
    toMetaMask: msg.data.target === 'metamask-inpage',
  };
}

// prettier-ignore
const transformedStream = s.transform(
  filter(isSameOrigin),
  filter(isRelatedToMetaMask)
)
 .transform(
  map(getMessageData),
  // debug
  // sideEffect(console.log)
);

function registerSite(post) {
  if (!s) return;
  getSiteMetadata()
    .then((metadata) => {
      if (!metadata.icon) delete metadata.icon;
      post({
        data: {
          method: 'wallet_registerSiteMetadata',
          params: metadata,
        },
        __byMSP: true,
        origin: location.host,
      });
    })
    .catch(() => null);
}

function setup() {
  const port = browser.runtime.connect({ name: 'content-script' });
  registerSite(port.postMessage.bind(port));

  window.addEventListener('message', s.next.bind(s));
  transformedStream.subscribe({
    next(data) {
      data.__fromMSP = true;
      port.postMessage.call(port, { ...data });
    },
    error(err) {
      error(err);
    },
  });
}

setup();
