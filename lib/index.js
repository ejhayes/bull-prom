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
exports.init = exports.JobStatus = void 0;
const client = require("prom-client");
var JobStatus;
(function (JobStatus) {
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
function init(opts) {
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
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
        maxAgeSeconds: 300,
        ageBuckets: 13,
    });
    const waitingDurationMetric = new promClient.Summary({
        name: waitingDurationMetricName,
        help: 'Time spent waiting for a job to run',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
        maxAgeSeconds: 300,
        ageBuckets: 13
    });
    const attemptsMadeMetric = new promClient.Summary({
        name: attemptsMadeMetricName,
        help: 'Job attempts made',
        labelNames: [QUEUE_NAME_LABEL, QUEUE_PREFIX_LABEL, STATUS_LABEL],
        maxAgeSeconds: 300,
        ageBuckets: 13
    });
    function recordJobMetrics(labels, status, job) {
        if (!job.finishedOn) {
            return;
        }
        const jobLabels = Object.assign({ [STATUS_LABEL]: status }, labels);
        const jobDuration = job.finishedOn - job.processedOn;
        durationMetric.observe(jobLabels, jobDuration);
        const waitingDuration = job.processedOn - job.timestamp;
        waitingDurationMetric.observe(jobLabels, waitingDuration);
        attemptsMadeMetric.observe(jobLabels, job.attemptsMade);
    }
    function start(queue) {
        const keyPrefix = queue.keyPrefix.replace(/.*\{|\}/gi, '');
        const labels = {
            [QUEUE_NAME_LABEL]: queue.name,
            [QUEUE_PREFIX_LABEL]: keyPrefix,
        };
        if (useGlobal) {
            queue.on('global:completed', (jobId) => __awaiter(this, void 0, void 0, function* () {
                const job = yield queue.getJob(jobId);
                recordJobMetrics(labels, JobStatus.COMPLETED, job);
            }));
            queue.on('global:failed', (jobId) => __awaiter(this, void 0, void 0, function* () {
                const job = yield queue.getJob(jobId);
                recordJobMetrics(labels, JobStatus.FAILED, job);
            }));
        }
        else {
            queue.on('completed', (job) => {
                recordJobMetrics(labels, JobStatus.COMPLETED, job);
            });
            queue.on('failed', (job) => {
                recordJobMetrics(labels, JobStatus.FAILED, job);
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
            waitingDurationMetric.remove(labels);
            attemptsMadeMetric.remove(labels);
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
