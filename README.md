# SINKRO

*Plug ES Observables into React components easily!*

## Usage

```javascript
import React from 'react'
import { render } from 'react-dom'
import { subscribe } from 'sinkro'
import { timer } from 'rxjs'
import { map } from 'rxjs/operators'

const NowView = ({ now }) => (
  <div>
    The Current time is {String(now)}
  </div>
)

const time$ = timer.pipe(map(() => new Date()))

const SubscribedNowView = subscribe({
  now: time$
})(SubscribedNowView)

const appRootElement = document.createElement('div')
document.body.appendChild(appRootElement)

render(
  <SubscribedNowView />,
  document.getElementById('app-container')
)
```

### Prerequisites

* [`react`](https://npmjs.com/package/react) is required (I aim to provoide Vue support in future releases).

### Installing

```
yarn add sinkro
```

## Running the tests

Ensure all prerequisites are installed by running `yarn` or `npm install`
then run the test suite with: `yarn test`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the code of conduct, and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the tags on this repository. 

## Authors

* **Samuel Rounce** - [srounce](https://github.com/srounce)

See also the list of contributors who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details
