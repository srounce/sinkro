import React, { Component } from 'react'

import { from, of, race } from 'rxjs'
import { combineAll, debounceTime, map, share, startWith } from 'rxjs/operators'

import isEqual from 'lodash.isequal'

const defaultOptions = () => ({
  overwriteProps: false,
  rate: 0
})

const prop$fromSubscriptionMap = subscriptionMap => {
  const subscriptionKeys = Object.keys(subscriptionMap)
  const subscriptionValues = Object.values(subscriptionMap)
    .concat(of(null))
    .map(v => isObservable(v)
      ? v
      : of(v)
    )

  return from(subscriptionValues).pipe(
    map(s => race(
      s,
      s.pipe(startWith(null))
    )),
    combineAll((...latest) =>
      subscriptionKeys.reduce(
        (a, k, i) => ({
          ...a,
          [k]: latest[i]
        }),
        {}
      )
    )
  )
}

const isObservable = maybeObservable =>
  typeof maybeObservable.subscribe === 'function'

export const subscribe = (subscriptionMap, userOptions) => {
  const options = {
    ...defaultOptions(),
    ...(userOptions || {})
  }

  let prop$ = isObservable(subscriptionMap)
    ? from(subscriptionMap)
    : prop$fromSubscriptionMap(subscriptionMap)

  if (options.rate) {
    prop$ = prop$.pipe(debounceTime(options.rate))
  }

  prop$ = prop$.pipe(share())

  const SubscriberProxy = SubscribedComponent => {
    class Subscriber extends Component {
      constructor (props, context) {
        super(props, context)

        this.subscribed = false
        this.subscription = null
      }

      componentDidMount () {
        this.subscription = prop$.subscribe(
          v => {
            this.subscribed = true
            this.setState(v)
          },
          e => console.error(e) // TODO: REPLACE THIS!
          , () => { debugger }
        )
      }

      componentWillUnmount () {
        this.subscription.unsubscribe()
        this.subscription = null
        this.subscribed = false
      }

      shouldComponentUpdate (nextProps, nextState) {
        return (
          this.subscribed &&
          (!isEqual(this.props, nextProps) || !isEqual(this.state, nextState))
        )
      }

      render () {
        const componentProps = options.overwriteProps
          ? { ...this.props, ...this.state }
          : { ...this.state, ...this.props }

        return <SubscribedComponent {...componentProps} />
      }
    }

    const componentName =
      SubscribedComponent.displayName || SubscribedComponent.name || '<unknown>'

    Subscriber.displayName = `Subscriber(${componentName})`

    return Subscriber
  }

  return SubscriberProxy
}
