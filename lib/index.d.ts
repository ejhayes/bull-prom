import * as kue from 'kue';
export interface Options {
    queue: kue.Queue;
    jobName: string;
    promClient?: any;
    prefixMetricName?: string;
    interval?: number;
}
export declare function init(opts: Options): {
    run: () => void;
    stop: () => void;
};
