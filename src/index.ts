import client = require('prom-client');
import * as kue from 'kue';

export interface Options {
  queue: kue.Queue;
  jobName: string;
  promClient?: any;
  prefixMetricName?: string;
  interval?: number;
}

const KueProm = (opts: Options) => {
  const {queue, jobName, interval = 60000, prefixMetricName = '', promClient = client} = opts;

  const activeMetricName = getFullMetricName(jobName, 'job_active', prefixMetricName);
  const inactiveMetricName = getFullMetricName(jobName, 'job_inactive', prefixMetricName);
  const completeMetricName = getFullMetricName(jobName, 'job_complete', prefixMetricName);
  const failedMetricName = getFullMetricName(jobName, 'job_failed', prefixMetricName);
  const delayedMetricName = getFullMetricName(jobName, 'job_delayed', prefixMetricName);

  const activeMetric = new promClient.Gauge(activeMetricName, 'Number of active job');
  const inactiveMetric = new promClient.Gauge(inactiveMetricName, 'Number of inactive job');
  const completeMetric = new promClient.Gauge(completeMetricName, 'Number of complete job');
  const failedMetric = new promClient.Gauge(failedMetricName, 'Number of failed job');
  const delayedMetric = new promClient.Gauge(delayedMetricName, 'Number of delayed job');

  let metricInterval: any;

  function run() {
    metricInterval = setInterval(() => {
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
    }, interval);
  }

  function stop() {
    metricInterval.clearInterval();
  }

  return {
    run,
    stop,
  };
};

function getFullMetricName(jobName: string, metricName: string, prefixName: string = '') {
  prefixName = (prefixName) ? `${prefixName}_` : '';

  return `${prefixName}${jobName}_${metricName}`;
}

export default KueProm;
