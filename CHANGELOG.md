<a name="3.2.1"></a>
## [3.2.1](https://github.com/pbadenski/bull-prom/compare/v3.1.1...v3.2.1) (2021-05-19)


### Features

* add configuration option to listen to global:completed event. Otherwise the local completed event will not work for completed jobs running elsewhere. ([c6a7af2](https://github.com/pbadenski/bull-prom/commit/c6a7af2693d09c9a5bdfb6910f56e61cce83ddee))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/pbadenski/bull-prom/compare/v3.1.0...v3.1.1) (2021-05-11)

### Chores

* upgrade all depeendencies to latest versions

<a name="3.1.0"></a>
# [3.1.0](https://github.com/pbadenski/bull-prom/compare/v3.0.0...v3.1.0) (2021-05-11)

### Features

* Add remove() function to queue metrics to allow removing all queue specific metrics from prometheus **@ejhayes** ([854b49c](https://github.com/pbadenski/bull-prom/commit/854b49c861f5dac7471790ba4e37aa5cb6d3d641))

<a name="3.0.0"></a>
# [3.0.0](https://github.com/pbadenski/bull-prom/compare/v2.1.0...v3.0.0) (2020-06-03)

### Features

* Add new 'queue_prefix' label **@robbiet480**
* Duration summary **@mjgp2**, **@robbiet480**
* Multi-queue support **@mjgp2**

### Bug Fixes

* upgrade yarn.lock ([f04f27d](https://github.com/pbadenski/bull-prom/commit/f04f27d4132f7d1f766c5f63867a329aaf3d45b7))

### Chores

* upgrade to prom-client v12 **@robbiet480**

<a name="2.1.0"></a>
## [2.1.0](https://github.com/pbadenski/bull-prom/compare/v2.0.0...v2.1.0) (2020-05-27)

### Chores

* **dependencies**: upgrade all to latest version ([8526b1](https://github.com/pbadenski/bull-prom/commit/8526b1)), closes ([#2](https://github.com/pbadenski/bull-prom/issues/2)) **@robbiet480**
