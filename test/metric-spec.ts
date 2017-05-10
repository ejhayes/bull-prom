import KueProm from '../src/metric';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as kue from 'kue';

const expect = chai.expect;

describe('metric', () => {
  describe('#run', () => {
    let createQueueStub;
    let inactiveStub;
    let queue;

    before(() => {
      createQueueStub = sinon.stub(kue, 'createQueue').returns(mockCreateQueue);
      queue = kue.createQueue();
      inactiveStub = sinon.stub(queue, 'inactiveCount', (name, callback) => { callback(); });
      const metric = KueProm({queue, jobName: 'lovely'});
    });
  });
});

function mockCreateQueue() {
  return {
    activeCount(name, callback) { callback(); },
    inactiveCount(name, callback) { callback(); },
    completeCount(name, callback) { callback(); },
    failedCount(name, callback) { callback(); },
    delayedCount(name, callback) { callback(); },
  };
}
