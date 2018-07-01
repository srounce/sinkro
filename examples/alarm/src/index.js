import { subscribe } from 'sinkro'
import React from 'react'
import { render } from 'react-dom'
import { timer } from 'rxjs'
import { map } from 'rxjs/operators'

const AlarmClock = ({ now, later }) => (
  <div>
    <h1>
      The Current time is {String(now)}
    </h1>
    <h2>
      Later it will be: {String(later)}
    </h2>
    <h3>
      Time until later: <strong>{(later - now) / 1000}s</strong>
    </h3>
  </div>
)

const SubscribedAlarmClock = subscribe({
  now: timer(0, 15).pipe(map(() => new Date())),
  later: new Date(Date.now() + (60 * 60 * 1000))
})(AlarmClock)

const appRootElement = document.createElement('div')
document.body.appendChild(appRootElement)

render(
  <SubscribedAlarmClock />,
  appRootElement
)
