import client = require('prom-client');
import * as bull from 'bull';

export interface Options {
  promClient?: any;
  labels?: string[];
  interval?: number;
}

export function init(opts: Options) {
  const { interval = 60000, promClient = client } = opts;
  const QUEUE_NAME_LABEL = 'queue_name';

  const activeMetricName = 'jobs_active_total';
  const waitingMetricName = 'jobs_waiting_total';
  const completedMetricName = 'jobs_completed_total';
  const failedMetricName = 'jobs_failed_total';
  const delayedMetricName = 'jobs_delayed_total';
  const durationMetricName = 'jobs_duration_milliseconds';

  const completedMetric = new promClient.Gauge({
    name: completedMetricName,
    help: 'Number of completed jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  const failedMetric = new promClient.Gauge({
    name: failedMetricName,
    help: 'Number of failed jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  const delayedMetric = new promClient.Gauge({
    name: delayedMetricName,
    help: 'Number of delayed jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  const activeMetric = new promClient.Gauge({
    name: activeMetricName,
    help: 'Number of active jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  const waitingMetric = new promClient.Gauge({
    name: waitingMetricName,
    help: 'Number of waiting jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  const durationMetric = new promClient.Summary({
    name: durationMetricName,
    help: 'Duration of jobs',
    labelNames: [QUEUE_NAME_LABEL],
  });

  function start(queue: bull.Queue) {
    let metricInterval: any;

    const labels = {
      [QUEUE_NAME_LABEL]: queue.name
    }

    queue.on('completed', (job) => {
      if (!job.finishedOn) {
        return;
      }
      const duration = job.finishedOn - job.processedOn!;
      durationMetric.observe(labels, duration);
    });

    metricInterval = setInterval(() => {
      queue
        .getJobCounts()
        .then(({ completed, failed, delayed, active, waiting }) => {
          completedMetric.set(labels, (completed || 0));
          failedMetric.set(labels, (failed || 0));
          delayedMetric.set(labels, (delayed || 0));
          activeMetric.set(labels, (active || 0));
          waitingMetric.set(labels, (waiting || 0));
        });
    }, interval);
    return {
      stop: () => metricInterval.clearInterval(),
    };
  }

  return {
    start,
  };
}
