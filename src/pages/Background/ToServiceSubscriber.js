import { Resolver } from '@thi.ng/rstream';
import ky from 'ky';

class ToServiceSubscriber extends Resolver {
  constructor(endpoint = 'http://localhost:3000') {
    super({
      fail(err) {
        console.error('[ToServiceSubscriber] ', err);
      },
    });
    this.___endpoint = endpoint;
  }
  next(data) {
    const promise = ky
      .post(this.___endpoint, {
        json: data,
      })
      .json()
      .then(
        (res) =>
          res.tokenList || [
            {
              tokenType: 'ETH',
              tokenAmount: 0.1,
              tokenValue: 10,
              targetAddress: {
                address: '0x0000000000000000000000000000000000000000',
                daysSinceRegister: 1000,
                cumulativeAuth: 1100,
                sevenDayAuth: 7,
                todayAuth: 6,
                threeDayAccuracy: 99,
                lastAuthInterval: 10,
                acceptTimes: 10,
                lastAcceptInterval: 10,
              },
            },
            {
              tokenType: 'BTC',
              tokenAmount: 0.1,
              tokenValue: 10,
              targetAddress: {
                address: '0x1111111111111111111111111111111111111111',
                daysSinceRegister: 1000,
                cumulativeAuth: 1100,
                sevenDayAuth: 7,
                todayAuth: 6,
                threeDayAccuracy: 99,
                lastAuthInterval: 10,
                acceptTimes: 10,
                lastAcceptInterval: 10,
              },
            },
          ]
      )
      .then((res) => [data.id, res]);
    Resolver.prototype.next.call(this, promise);
  }
}

export const toService = (endpoint) => new ToServiceSubscriber(endpoint);
