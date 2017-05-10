import promClient = require('prom-client');
import * as kue from 'kue';

export interface Options {
  queue: kue.Queue;
  prefixMetricName: string;
  jobName: string;
}

const KueProm = (opts: Options) => {
  const {queue, jobName, prefixMetricName = ''} = opts;

  const activeMetricName = getFullMetricName(jobName, 'active_count', prefixMetricName);
  const inactiveMetricName = getFullMetricName(jobName, 'inactive_count', prefixMetricName);
  const completeMetricName = getFullMetricName(jobName, 'complete_count', prefixMetricName);
  const failedMetricName = getFullMetricName(jobName, 'failed_count', prefixMetricName);
  const delayedMetricName = getFullMetricName(jobName, 'delayed_count', prefixMetricName);

  const activeMetric = new promClient.Gauge(activeMetricName, 'Number of active job');
  const inactiveMetric = new promClient.Gauge(inactiveMetricName, 'Number of inactive job');
  const completeMetric = new promClient.Gauge(completeMetricName, 'Number of complete job');
  const failedMetric = new promClient.Gauge(failedMetricName, 'Number of failed job');
  const delayedMetric = new promClient.Gauge(delayedMetricName, 'Number of delayed job');

  function start() {
    queue.activeCount(jobName, (err: any, total: number) => {
      activeMetric.set(total);
    });

    queue.inactiveCount(jobName, (err: any, total: number) => {
      inactiveMetric.set(total);
    });

    queue.completeCount(jobName, (err: any, total: number) => {
      completeMetric.set(total);
    });

    queue.failedCount(jobName, (err: any, total: number) => {
      failedMetric.set(total);
    });

    queue.delayedCount(jobName, (err: any, total: number) => {
      delayedMetric.set(total);
    });
  }
};

function getFullMetricName(jobName: string, metricName: string, prefix: string = '') {
  const prefixName = (prefix) ? `${prefix}_` : '';

  return `${prefixName}${jobName}_${metricName}`;
}

export default KueProm;
