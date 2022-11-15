# Bull Prom
[![npm version](https://badge.fury.io/js/bull-prom.svg?style=flat)](http://badge.fury.io/js/bull-prom)

Provides [Prometheus](https://prometheus.io/) metrics for [Bull](https://github.com/OptimalBits/bull)

## Metrics

| Metric                              | type    | description                                             |
|-------------------------------------|---------|---------------------------------------------------------|
| jobs_completed_total                | counter | Total number of completed jobs                          |
| jobs_active_total                   | counter | Total number of active jobs (currently being processed) |
| jobs_delayed_total                  | counter | Total number of jobs that will run in the future        |
| jobs_failed_total                   | counter | Total number of failed jobs                             |
| jobs_waiting_total                  | counter | Total number of jobs waiting to be processed            |
| jobs_paused_total                   | counter | Total number of paused jobs                             |
| jobs_duration_milliseconds          | summary | Processing time for completed/failed                    |
| jobs_waiting_duration_milliseconds  | summary | Waiting time for completed/failed                       |
| jobs_attempts                       | summary | Processing time for completed/failed/jobs               |

_IMPORTANT_: If you are using this library to track job duration metrics for a queue for multiple consumers you will need to listen to the `global:completed` event. Otherwise this library will not record job duration metrics. To listen to this event instead of the `completed` event you'll need to set the init paremeter `useGlobal` to true.

## Usage
```typescript
import Queue from 'bull';
import promClient from 'prom-client';
import * as bullProm from 'bull-prom';

const queue = new Queue('myQueue'...);

const bullMetric = bullProm.init({
  promClient, // optional, it will use internal prom client if it is not given
  interval: 1000, // optional, in ms, default to 60000
  useGlobal: false, // optional, default to false
});

const started = bullMetric.start(queue);

// Optional
started.stop();

// Metrics result in Prometheus
// jobs_waiting_total{queue_name="myQueue", queue_prefix="default"} 0
// jobs_active_total{queue_name="myQueue", queue_prefix="default"} 0
// jobs_complete_total{queue_name="myQueue", queue_prefix="default"} 0
// jobs_failed_total{queue_name="myQueue", queue_prefix="default"} 0
// jobs_delayed_total{queue_name="myQueue", queue_prefix="default"} 0
```

## API
### init(options)
Initialize

options:
- `promClient` (*optional*): prom client instance
- `interval` (*optional*, default `60000`): interval in ms to fetch the Bull statistic
- `useGlobal` (*optional*, default `false`)

### start(queue)
Start running and fetching the data from Bull based on interval with the given Bull queue.

Returns a queue metrics object which includes the following methods:
- `stop()`: stops monitoring the queue metrics
- `remove()`: removes metrics from prometheus


## Contributors

* **@mjgp2**
* **@robbiet480**
* **@TotallyNotElite**
* **@ejhayes**

## License
MIT © [Pawel Badenski](https://github.com/pbadenski)

This library is largely derived from [kue-prom](https://github.com/deerawan/kue-prom) (MIT © [Budi Irawan](https://github.com/deerawan))
