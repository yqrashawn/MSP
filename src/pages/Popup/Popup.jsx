import React, { useEffect } from 'react';
import { useSearchParam } from 'react-use';
import { useSingleTx } from '../../db.js';
import { groupBy, reductions } from '@thi.ng/iterators';
import cover from './cover.svg';

function useTx() {
  const txId = useSearchParam('tx');
  const tx = useSingleTx(txId);
  return tx;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const ONE_DAY = 24 * 60 * 60 * 1000;

function daysTillNowRounded(ms, str) {
  const now = new Date().getTime();
  const day = Math.min(0, Math.floor((now - ms) / ONE_DAY));
  const isDays = day > 1 ? true : false;
  if (str) {
    `${day} ${isDays ? 'days' : 'day'}`;
  } else {
    return { day, isDays };
  }
}

function ApprovalHeader() {
  let { approvals } = useTx();

  const approvalsMapByToken = groupBy((x) => x.tokenType, approvals);

  return (
    <header className="flex flex-row items-center p-2 bg-#F7FF0045 mb-2">
      <p mr="4">⚠</p>
      <div>
        <p>
          Found
          <b>{` ${approvals.length} `}</b>
          Token {`${approvals.length < 2 ? 'Approval' : 'Approvals'}`}
        </p>
        <ol>
          {Object.entries(approvalsMapByToken).map(([symbol, targets]) => {
            symbol = JSON.parse(symbol);
            return (
              <li key={symbol}>
                Approved{' '}
                <b>{targets.reduce((acc, x) => acc + x.tokenAmount, 0)}</b>
                {` ${symbol}(≅${targets.reduce(
                  (acc, x) => acc + x.tokenValue,
                  0
                )} USDT) to `}
                <b>{targets.length}</b>
                {`${targets.length > 1 ? ' addresses' : ' address'} `}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}

function OneApproval({ symbol, tokenValue, tokenAmount, targetAddress }) {
  // prettier-ignore
  return (
    <ul className='b-1 my-2 p-2 text-sm'>
      <li>{`Target Address: `}<b>{targetAddress.address}</b></li>
      <li>{`Amount: `}<b>{tokenAmount}</b>{` ${symbol}(${tokenValue} USDT)`}</li>
      <li>
        <ul>
          <li>{`Deployed at: `}<b>{targetAddress.daysSinceRegister}</b>{` Days Before`}</li>
          <li>{`You've approved `} <b>{targetAddress.acceptTimes}</b>{` times before`}</li>
          <li>{`Your last approval: `} <b>{`${targetAddress.lastAcceptInterval}min`}</b>{` ago`}</li>
          <li>{`Approval success rate (3 days): `} <b>{`${targetAddress.threeDayAccuracy}%`}</b></li>
          <li>{`Approvals (all address) in 7 days: `} <b>{targetAddress.sevenDayAuth}</b>{` times`}</li>
          <li>{`Approvals (all address) in today: `} <b>{targetAddress.todayAuth}</b>{` times`}</li>
          <li>{`Approvals (all address) till now: `} <b>{targetAddress.cumulativeAuth}</b>{` times`}</li>
          <li>{`Last successful approval(all address): `} <b>{`${targetAddress.lastAuthInterval}min`}</b>{` ago`}</li>
        </ul>
      </li>
    </ul>
  );
}

function ApprovalBody() {
  let { approvals } = useTx();

  const approvalsMapByToken = groupBy((x) => x.tokenType, approvals);
  return (
    <ul>
      {Object.entries(approvalsMapByToken).map(([symbol, targets]) => {
        symbol = JSON.parse(symbol);
        return (
          <li key={symbol} className="p-2 bg-slate-50 mb-4 text-lg">
            {symbol}
            {targets.map((tx) => (
              <OneApproval symbol={symbol} {...tx} />
            ))}
          </li>
        );
      })}
    </ul>
  );
}

function Tx() {
  return (
    <div>
      <ApprovalHeader />
      <ApprovalBody />
    </div>
  );
}

const Popup = () => {
  const txId = useSearchParam('tx');
  if (txId) {
    return (
      <div className="w-420px h-260px px-4 pt-2">
        <Tx />
        <button
          className="bg-blue w-100% h-30px m-auto block mb-2"
          onClick={() => window.close()}
        >
          OK
        </button>
        <div className=" w-100% h-4px m-auto block" />
      </div>
    );
  }
  return (
    <div
      className="px-4 pt-2 w-388px h-218px bg-cover"
      style={{ backgroundImage: 'url(/cover.svg)' }}
    >
      <p className="absolute left-8 top-45 text-white font-black text-lg">
        Try send transaction with MetaMask
      </p>
    </div>
  );
};

export default Popup;
