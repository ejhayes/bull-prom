"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client = require("prom-client");
function init(opts) {
    const { queue, interval = 60000, promClient = client } = opts;
    const activeMetricName = 'jobs_active_total';
    const waitingMetricName = 'jobs_waiting_total';
    const completedMetricName = 'jobs_completed_total';
    const failedMetricName = 'jobs_failed_total';
    const delayedMetricName = 'jobs_delayed_total';
    const completedMetric = new promClient.Gauge(completedMetricName, 'Number of completed jobs', ['queueName']);
    const failedMetric = new promClient.Gauge(failedMetricName, 'Number of failed jobs', ['queueName']);
    const delayedMetric = new promClient.Gauge(delayedMetricName, 'Number of delayed jobs', ['queueName']);
    const activeMetric = new promClient.Gauge(activeMetricName, 'Number of active jobs', ['queueName']);
    const waitingMetric = new promClient.Gauge(waitingMetricName, 'Number of waiting jobs', ['queueName']);
    let metricInterval;
    function run() {
        metricInterval = setInterval(() => {
            queue.getJobCounts().then(({ completed, failed, delayed, active, wait }) => {
                completedMetric.labels(queue.name).set(completed || 0);
                failedMetric.labels(queue.name).set(failed || 0);
                delayedMetric.labels(queue.name).set(delayed || 0);
                activeMetric.labels(queue.name).set(active || 0);
                waitingMetric.labels(queue.name).set(wait || 0);
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
