# Bull Prom
Provides [promotheus](https://prometheus.io/) metrics for [Bull](https://github.com/OptimalBits/bull)

Metrics:
- waiting jobs (gauge)
- active jobs (gauge)
- completed jobs (gauge)
- failed jobs (gauge)
- delayed jobs (gauge)

## Usage
```typescript
import Queue from 'bull';
import promClient from 'prom-client';
import * as bullProm from 'bull-prom';

const queue = new Queue('myQueue'...);

const bullMetric = bullProm.init({
  queue,
  promClient, // optional, it will use internal prom client if it is not given
  interval: 1000, // optional, in ms, default to 60000
});

bullMetric.run();

// Metrics result in Promotheus
// jobs_waiting_total{queue_name="myQueue"} 0
// jobs_active_total{queue_name="myQueue"} 0
// jobs_complete_total{queue_name="myQueue"} 0
// jobs_failed_total{queue_name="myQueue"} 0
// jobs_delayed_total{queue_name="myQueue"} 0
```

## API
### init(options)
Initialize

options:
- queue (**required**): bull queue
- promClient (*optional*): prom client instance
- interval (*optional*, default 60000): interval in ms to fetch the Bull statistic

### run()
Start running and fetching the data from Bull based on interval

### stop()
Stop running

## License
MIT © [Pawel Badenski](https://github.com/pbadenski)

This library is largely derived from [kue-prom](https://github.com/deerawan/kue-prom) (MIT © [Budi Irawan](https://github.com/deerawan))
