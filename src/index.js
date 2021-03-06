import React, { Component } from 'react'

import { from, of, race } from 'rxjs'
import { combineAll, debounceTime, map, share, startWith } from 'rxjs/operators'

import isEqual from 'lodash.isequal'

const defaultOptions = () => ({
  overwriteProps: false,
  ignoreByProps: false,
  rate: 0,
  share: true,
  compareProps: isEqual,
  compareStream: isEqual
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
      s.pipe(startWith(undefined))
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
  typeof maybeObservable === 'object' &&
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

  if (options.share) {
    prop$ = prop$.pipe(share())
  }

  const SubscriberProxy = SubscribedComponent => {
    class Subscriber extends Component {
      constructor (props, context) {
        super(props, context)

        this.subscribed = false
        this.subscription = null
      }

      // eslint-disable-next-line camelcase
      UNSAFE_componentWillMount () {
        this.subscription = prop$.subscribe(
          v => {
            this.subscribed = true
            const propKeys = Object.keys(this.props)
            let newState = v
            
            if (options.ignoreByProps) {
              newState = Object.keys(v)
                .filter(k => !propKeys.includes(k))
                .reduce((acc, key) => ({ ...acc, [key]: v[key] }), {})
            }

            this.setState(prev => (isEqual(newState, prev) ? null : newState))
          },
          e => console.error(e) // TODO: REPLACE THIS!
        )
      }

      componentWillUnmount () {
        this.subscription.unsubscribe()
        this.subscription = null
        this.subscribed = false
      }

      shouldComponentUpdate (nextProps, nextState) {
        return (
          this.subscribed && (
            !options.compareProps(this.props, nextProps) ||
            !options.compareStream(this.state, nextState)
          )
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
