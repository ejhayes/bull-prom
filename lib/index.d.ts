import * as bull from 'bull';
export interface Options {
    queue: bull.Queue;
    promClient?: any;
    labels?: string[];
    interval?: number;
}
export declare function init(opts: Options): {
    run: () => void;
    stop: () => void;
};
