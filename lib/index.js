"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const client = require("prom-client");
function init(opts) {
    const { interval = 60000, promClient = client, useGlobal = false } = opts;
    const QUEUE_NAME_LABEL = 'queue_name';
    const QUEUE_PREFIX_LABEL = 'queue_prefix';
    const activeMetricName = 'jobs_active_total';
    const waitingMetricName = 'jobs_waiting_total';
    const completedMetricName = 'jobs_completed_total';
    const failedMetricName = 'jobs_failed_total';
    const delayedMetricName = 'jobs_delayed_total';
    const durationMetricName = 'jobs_duration_milliseconds';
    const completedMetric = new promClient.Gauge({
        name: completedMetricName,
        help: 'Number of completed jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
    });
    const failedMetric = new promClient.Gauge({
        name: failedMetricName,
        help: 'Number of failed jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
    });
    const delayedMetric = new promClient.Gauge({
        name: delayedMetricName,
        help: 'Number of delayed jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
    });
    const activeMetric = new promClient.Gauge({
        name: activeMetricName,
        help: 'Number of active jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
    });
    const waitingMetric = new promClient.Gauge({
        name: waitingMetricName,
        help: 'Number of waiting jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
    });
    const durationMetric = new promClient.Summary({
        name: durationMetricName,
        help: 'Time to complete jobs',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL],
        maxAgeSeconds: 300,
        ageBuckets: 13,
    });
    function start(queue) {
        const keyPrefix = queue.keyPrefix.replace(/.*\{|\}/gi, '');
        const labels = {
            [QUEUE_NAME_LABEL]: queue.name,
            [QUEUE_PREFIX_LABEL]: keyPrefix,
        };
        if (useGlobal) {
            queue.on('global:completed', (jobId) => __awaiter(this, void 0, void 0, function* () {
                const job = yield queue.getJob(jobId);
                if (!job.finishedOn) {
                    return;
                }
                const duration = job.finishedOn - job.processedOn;
                durationMetric.observe(labels, duration);
            }));
        }
        else {
            queue.on('completed', (job) => {
                if (!job.finishedOn) {
                    return;
                }
                const duration = job.finishedOn - job.processedOn;
                durationMetric.observe(labels, duration);
            });
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
        };
        return {
            stop: () => clearInterval(metricInterval),
            remove: removeMetrics
        };
    }
    return {
        start,
    };
}
exports.init = init;
