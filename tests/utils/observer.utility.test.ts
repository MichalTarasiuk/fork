import { createObserver, noop } from '../../src/utils/utils'

describe('observer', () => {
  it('should subscribe observer', () => {
    // given
    const observer = createObserver<string>()

    // when
    observer.subscribe(noop)

    // then
    expect(observer.listeners).toHaveLength(1)
  })

  it('should unsubscribe observer', () => {
    // given
    const observer = createObserver<string>()

    // when
    const subscriber = observer.subscribe(noop)

    // then
    expect(observer.listeners).toHaveLength(1)

    // when
    subscriber.unsubscribe()

    // then
    expect(observer.listeners).toHaveLength(0)
  })

  it('should notify all subscribers', () => {
    // given
    const fruits = ['apple', 'banana', 'orange', 'lemon']
    const observer = createObserver<string>()
    const spy = jest.fn()

    // when
    observer.subscribe(spy)

    // then
    expect(observer.listeners).toHaveLength(1)

    // when
    fruits.forEach((fruit) => {
      observer.notify(fruit, fruit)
    })

    // then
    expect(spy).toHaveBeenCalledTimes(fruits.length)
  })

  it('should not invoke emitter when is defined', () => {
    //given
    const observer = createObserver<string>()

    // when
    const spy1 = jest.fn()
    observer.subscribe(spy1)

    // then
    expect(observer.listeners).toHaveLength(1)

    // when
    const spy2 = jest.fn()
    observer.subscribe(spy2)

    // then
    expect(observer.listeners).toHaveLength(2)

    // when
    observer.notify('apple', undefined, spy1)

    // then
    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(1)
  })
})
