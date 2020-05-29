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
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  const failedMetric = new promClient.Gauge({
    name: failedMetricName,
    help: 'Number of failed jobs',
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  const delayedMetric = new promClient.Gauge({
    name: delayedMetricName,
    help: 'Number of delayed jobs',
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  const activeMetric = new promClient.Gauge({
    name: activeMetricName,
    help: 'Number of active jobs',
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  const waitingMetric = new promClient.Gauge({
    name: waitingMetricName,
    help: 'Number of waiting jobs',
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  const durationMetric = new promClient.Summary({
    name: durationMetricName,
    help: 'Duration of jobs',
    defaultLabels: [QUEUE_NAME_LABEL],
  });

  function start(queue: bull.Queue) {
    let metricInterval: any;

    queue.on('completed', (job) => {
      if (!job.finishedOn) {
        return;
      }
      const duration = job.finishedOn - job.processedOn!;
      durationMetric.labels((queue as any).name).observe(duration);
    });

    metricInterval = setInterval(() => {
      queue
        .getJobCounts()
        .then(({ completed, failed, delayed, active, waiting }) => {
          completedMetric.labels((queue as any).name).set(completed || 0);
          failedMetric.labels((queue as any).name).set(failed || 0);
          delayedMetric.labels((queue as any).name).set(delayed || 0);
          activeMetric.labels((queue as any).name).set(active || 0);
          waitingMetric.labels((queue as any).name).set(waiting || 0);
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
