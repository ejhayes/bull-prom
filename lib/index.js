"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client = require("prom-client");
function init(opts) {
    const { queue, interval = 60000, promClient = client } = opts;
    const QUEUE_NAME_LABEL = 'queue_name';
    const activeMetricName = 'jobs_active_total';
    const waitingMetricName = 'jobs_waiting_total';
    const completedMetricName = 'jobs_completed_total';
    const failedMetricName = 'jobs_failed_total';
    const delayedMetricName = 'jobs_delayed_total';
    const completedMetric = new promClient.Gauge(completedMetricName, 'Number of completed jobs', [QUEUE_NAME_LABEL]);
    const failedMetric = new promClient.Gauge(failedMetricName, 'Number of failed jobs', [QUEUE_NAME_LABEL]);
    const delayedMetric = new promClient.Gauge(delayedMetricName, 'Number of delayed jobs', [QUEUE_NAME_LABEL]);
    const activeMetric = new promClient.Gauge(activeMetricName, 'Number of active jobs', [QUEUE_NAME_LABEL]);
    const waitingMetric = new promClient.Gauge(waitingMetricName, 'Number of waiting jobs', [QUEUE_NAME_LABEL]);
    let metricInterval;
    function run() {
        metricInterval = setInterval(() => {
            queue.getJobCounts().then(({ completed, failed, delayed, active, waiting }) => {
                completedMetric.labels(queue.name).set(completed || 0);
                failedMetric.labels(queue.name).set(failed || 0);
                delayedMetric.labels(queue.name).set(delayed || 0);
                activeMetric.labels(queue.name).set(active || 0);
                waitingMetric.labels(queue.name).set(waiting || 0);
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
}
exports.init = init;
