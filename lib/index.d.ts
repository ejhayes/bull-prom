import client = require('prom-client');
import * as bull from 'bull';
export interface Options {
    promClient?: typeof client;
    interval?: number;
    useGlobal?: boolean;
}
export declare enum JobStatus {
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare function init(opts: Options): {
    start: (queue: bull.Queue) => {
        stop: () => void;
        remove: () => void;
    };
};
