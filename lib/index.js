"use strict";
exports.__esModule = true;
var client = require("prom-client");
function init(opts) {
    var queue = opts.queue, jobName = opts.jobName, _a = opts.interval, interval = _a === void 0 ? 60000 : _a, _b = opts.prefixMetricName, prefixMetricName = _b === void 0 ? '' : _b, _c = opts.promClient, promClient = _c === void 0 ? client : _c;
    var activeMetricName = getFullMetricName(jobName, 'job_active', prefixMetricName);
    var inactiveMetricName = getFullMetricName(jobName, 'job_inactive', prefixMetricName);
    var completeMetricName = getFullMetricName(jobName, 'job_complete', prefixMetricName);
    var failedMetricName = getFullMetricName(jobName, 'job_failed', prefixMetricName);
    var delayedMetricName = getFullMetricName(jobName, 'job_delayed', prefixMetricName);
    var activeMetric = new promClient.Gauge(activeMetricName, 'Number of active job');
    var inactiveMetric = new promClient.Gauge(inactiveMetricName, 'Number of inactive job');
    var completeMetric = new promClient.Gauge(completeMetricName, 'Number of complete job');
    var failedMetric = new promClient.Gauge(failedMetricName, 'Number of failed job');
    var delayedMetric = new promClient.Gauge(delayedMetricName, 'Number of delayed job');
    var metricInterval;
    function run() {
        metricInterval = setInterval(function () {
            queue.activeCount(jobName, function (err, total) {
                activeMetric.set(total);
            });
            queue.inactiveCount(jobName, function (err, total) {
                inactiveMetric.set(total);
            });
            queue.completeCount(jobName, function (err, total) {
                completeMetric.set(total);
            });
            queue.failedCount(jobName, function (err, total) {
                failedMetric.set(total);
            });
            queue.delayedCount(jobName, function (err, total) {
                delayedMetric.set(total);
            });
        }, interval);
    }
    function stop() {
        metricInterval.clearInterval();
    }
    return {
        run: run,
        stop: stop
    };
}
exports.init = init;
function getFullMetricName(jobName, metricName, prefixName) {
    if (prefixName === void 0) { prefixName = ''; }
    prefixName = (prefixName) ? prefixName + "_" : '';
    return "" + prefixName + jobName + "_" + metricName;
}
