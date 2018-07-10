import React from 'react'
import { of, interval } from 'rxjs'
import { subscribe } from '.'
import { mount } from 'enzyme'

jest.useFakeTimers()

describe('subscribe(subscriptionMap: Object | Observable): (SubscribedComponent: React.Component) => React.Component', () => {
  test.concurrent('it is a Function', async () => {
    expect(subscribe).toBeDefined()
    expect(subscribe).toBeInstanceOf(Function)
  })

  describe('when `subscriptionMap` is an empty Object', () => {
    test.concurrent('it returns a Function', async () => {
      expect(subscribe({})).toBeInstanceOf(Function)
    })

    test.concurrent('which accepts a React component and returns a subscribed React component', async () => {
      const TestComponent = () => null
      const SubscribedComponent = subscribe({})(TestComponent)
      expect(SubscribedComponent).toBeInstanceOf(Function)

      const rendered = mount(<SubscribedComponent static />)
      expect(rendered.props().static).toEqual(true)
      expect(Object.keys(rendered.props())).toHaveLength(1)
    })
  })

  describe('when `subscriptionMap` values are ES Observables', () => {
    test.concurrent('it returns a Function', async () => {
      expect(subscribe({ test: of(100) })).toBeInstanceOf(Function)
    })

    test.concurrent('which accepts a React component and returns a subscribed React component', async () => {
      const TestComponent = jest.fn((props) => null)
      const intervalRate = 100
      const debounceRate = 10
      const SubscribedComponent = subscribe(
        { test: interval(intervalRate) },
        { debounceRate }
      )(TestComponent)
      expect(SubscribedComponent).toBeInstanceOf(Function)

      mount(<SubscribedComponent static />)
      jest.advanceTimersByTime(intervalRate + debounceRate)

      expect(TestComponent).toHaveBeenCalledTimes(2)
      expect(TestComponent).toHaveBeenCalledWith({ static: true, test: 0 }, {})
    })
  })

  describe('when `subscriptionMap` values are plain JS values', () => {
    test.concurrent('it returns a Function', async () => {
      expect(subscribe({ test: [1, 2, 3] })).toBeInstanceOf(Function)
    })

    test.concurrent(`it wraps non-observables passed via the subscription map`, async () => {
      const TestComponent = jest.fn((props) => null)
      const SubscribedComponent = subscribe({ test: [1, 2, 3] })(TestComponent)
      expect(SubscribedComponent).toBeInstanceOf(Function)

      mount(<SubscribedComponent static />)

      expect(TestComponent).toHaveBeenCalledTimes(1)
      expect(TestComponent).toHaveBeenCalledWith({ static: true, test: [1, 2, 3] }, {})
    })
  })
})
