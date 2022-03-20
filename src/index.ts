import client = require('prom-client');
import * as bull from 'bull';
import { getOrCreateMetric, Metrics } from './utils';

export interface Options {
  promClient?: typeof client;
  interval?: number;
  useGlobal?: boolean;
}

export enum JobStatus {
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export function init(opts: Options) {
  const { interval = 60000, promClient = client, useGlobal = false } = opts;

  const QUEUE_NAME_LABEL = 'queue_name';
  const QUEUE_PREFIX_LABEL = 'queue_prefix';
  const STATUS_LABEL = 'status';

  const activeMetricName = 'jobs_active_total';
  const waitingMetricName = 'jobs_waiting_total';
  const completedMetricName = 'jobs_completed_total';
  const failedMetricName = 'jobs_failed_total';
  const delayedMetricName = 'jobs_delayed_total';
  const durationMetricName = 'jobs_duration_milliseconds';
  const waitingDurationMetricName = 'jobs_waiting_duration_milliseconds';
  const attemptsMadeMetricName = 'jobs_attempts';

  const completedMetric = getOrCreateMetric(Metrics.Gauge, {
    name: completedMetricName,
    help: 'Number of completed jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
  }) as client.Gauge<string>;

  const failedMetric = getOrCreateMetric(Metrics.Gauge, {
    name: failedMetricName,
    help: 'Number of failed jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
  }) as client.Gauge<string>;

  const delayedMetric = getOrCreateMetric(Metrics.Gauge, {
    name: delayedMetricName,
    help: 'Number of delayed jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
  }) as client.Gauge<string>;

  const activeMetric = getOrCreateMetric(Metrics.Gauge, {
    name: activeMetricName,
    help: 'Number of active jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
  }) as client.Gauge<string>;

  const waitingMetric = getOrCreateMetric(Metrics.Gauge, {
    name: waitingMetricName,
    help: 'Number of waiting jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
  })as client.Gauge<string>;

  const durationMetric = getOrCreateMetric(Metrics.Summary, {
    name: durationMetricName,
    help: 'Time to complete jobs',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
    maxAgeSeconds: 300,
    ageBuckets: 13,
  }) as client.Summary<string>;

  const waitingDurationMetric = getOrCreateMetric(Metrics.Summary, {
    name: waitingDurationMetricName,
    help: 'Time spent waiting for a job to run',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
    maxAgeSeconds: 300,
    ageBuckets: 13
  }) as client.Summary<string>;

  const attemptsMadeMetric = getOrCreateMetric(Metrics.Summary, {
    name: attemptsMadeMetricName,
    help: 'Job attempts made',
    labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
    maxAgeSeconds: 300,
    ageBuckets: 13
  }) as client.Summary<string>;

  function recordJobMetrics(labels: {[key: string]: string}, status: JobStatus, job: bull.Job) {
    if (!job.finishedOn) {
      return;
    }

    const jobLabels = {
      [STATUS_LABEL]: status,
      ...labels
    }

    const jobDuration = job.finishedOn - job.processedOn!;
    durationMetric.observe(jobLabels, jobDuration);

    const waitingDuration = job.processedOn - job.timestamp;
    waitingDurationMetric.observe(jobLabels, waitingDuration);

    attemptsMadeMetric.observe(jobLabels, job.attemptsMade);
  }

  function start(queue: bull.Queue) {

    // @ts-ignore
    const keyPrefix = queue.keyPrefix.replace(/.*\{|\}/gi, '')

    const labels = {
      [QUEUE_NAME_LABEL]: queue.name,
      [QUEUE_PREFIX_LABEL]: keyPrefix,
    }

    if (useGlobal) {
      queue.on('global:completed', async (jobId: number) => {
        const job = await queue.getJob(jobId);
        recordJobMetrics(labels, JobStatus.COMPLETED, job);
      });
      queue.on('global:failed', async (jobId: number) => {
        const job = await queue.getJob(jobId);
        recordJobMetrics(labels, JobStatus.FAILED, job)
      })
    } else {
      queue.on('completed', (job) => {
        recordJobMetrics(labels, JobStatus.COMPLETED, job);
      });
      queue.on('failed', (job) => {
        recordJobMetrics(labels, JobStatus.FAILED, job)
      })
    }

    const metricInterval = setInterval(() => {
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

    const removeMetrics = () => {
      durationMetric.remove(labels);
      completedMetric.remove(labels);
      failedMetric.remove(labels);
      delayedMetric.remove(labels);
      activeMetric.remove(labels);
      waitingMetric.remove(labels);
      waitingDurationMetric.remove(labels);
      attemptsMadeMetric.remove(labels);
    }
    return {
      stop: () => clearInterval(metricInterval),
      remove: removeMetrics
    };
  }

  return {
    start,
  };
}
