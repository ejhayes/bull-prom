import client = require('prom-client');
import * as bull from 'bull';
export interface Options {
    promClient?: typeof client;
    interval?: number;
}
export declare function init(opts: Options): {
    start: (queue: bull.Queue) => {
        stop: () => void;
        remove: () => void;
    };
};
