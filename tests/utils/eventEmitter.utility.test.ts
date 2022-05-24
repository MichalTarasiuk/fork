import { createEventEmitter, noop } from '../../src/utils/utils'

describe('observer', () => {
  it('should subscribe observer', () => {
    // given
    const eventEmitter = createEventEmitter<string>()

    // when
    eventEmitter.subscribe(noop)

    // then
    expect(eventEmitter.listeners).toHaveLength(1)
  })

  it('should unsubscribe observer', () => {
    // given
    const eventEmitter = createEventEmitter<string>()

    // when
    const subscriber = eventEmitter.subscribe(noop)

    // then
    expect(eventEmitter.listeners).toHaveLength(1)

    // when
    subscriber.unsubscribe()

    // then
    expect(eventEmitter.listeners).toHaveLength(0)
  })

  it('should notify all subscribers', () => {
    // given
    const fruits = ['apple', 'banana', 'orange', 'lemon']
    const eventEmitter = createEventEmitter<string>()
    const spy = jest.fn()

    // when
    eventEmitter.subscribe(spy)

    // then
    expect(eventEmitter.listeners).toHaveLength(1)

    // when
    fruits.forEach((fruit) => {
      eventEmitter.notify(fruit, fruit)
    })

    // then
    expect(spy).toHaveBeenCalledTimes(fruits.length)
  })

  it('should not invoke emitter when is defined', () => {
    //given
    const eventEmitter = createEventEmitter<string>()

    // when
    const spy1 = jest.fn()
    eventEmitter.subscribe(spy1)

    // then
    expect(eventEmitter.listeners).toHaveLength(1)

    // when
    const spy2 = jest.fn()
    eventEmitter.subscribe(spy2)

    // then
    expect(eventEmitter.listeners).toHaveLength(2)

    // when
    eventEmitter.notify('apple', undefined, spy1)

    // then
    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(1)
  })
})
