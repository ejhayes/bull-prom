# Bull Prom
Provides [promotheus](https://prometheus.io/) metrics for [Bull](https://github.com/OptimalBits/bull)

Metrics:
- inactive job (gauge)
- active job (gauge)
- completed job (gauge)
- failed job (gauge)
- delayed job (gauge)

## Usage
```typescript
import Queue from 'bull';
import promClient from 'prom-client';
import * as bullProm from 'bull-prom';

const queue = new Queue(...);

const bullMetric = bullProm.init({
  queue,
  promClient, // optional, it will use internal prom client if it is not given
  interval: 1000, // optional, in ms, default to 60000
  prefixMetricName: 'my_app' // optional
});

bullMetric.run();

// Metrics result in Promotheus
// my_app_pdf_job_inactive
// my_app_pdf_job_active
// my_app_pdf_job_complete
// my_app_pdf_job_failed
// my_app_pdf_job_delayed
```

## API
### init(options)
Initialize

options:
- queue (**required**): bull queue
- promClient (*optional*): prom client instance
- interval (*optional*, default 60000): interval in ms to fetch the Bull statistic
- prefixMetricName (*optional*): prefix for metric name

### run()
Start running and fetching the data from Bull based on interval

### stop()
Stop running

## License
MIT © [Pawel Badenski](https://github.com/pbadenski)

This library is largely derived from [kue-prom](https://github.com/deerawan/kue-prom) (MIT © [Budi Irawan](https://github.com/deerawan)
