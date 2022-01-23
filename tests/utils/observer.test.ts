import { createObserver, noop } from '../../src/utils'

describe('observer', () => {
  it('should subscribe observer', () => {
    // given
    const observer = createObserver<string>()

    // when
    observer.subscribe(observer.create(noop))

    // then
    expect(observer.observers).toHaveLength(1)
  })

  it('should destroy all subscribers', () => {
    // given
    const observer = createObserver<string>()

    // when
    observer.subscribe(observer.create(noop))
    observer.subscribe(observer.create(noop))

    // then
    expect(observer.observers).toHaveLength(2)

    // when
    observer.destroy()

    // then
    expect(observer.observers).toHaveLength(0)
  })

  it('should notify all subscribers', () => {
    // given
    const fruits = ['apple', 'banana', 'orange', 'lemon']
    const observer = createObserver<string>()
    const spy = jest.fn()

    // when
    observer.subscribe(observer.create(spy))

    // then
    expect(observer.observers).toHaveLength(1)

    // when
    fruits.forEach((fruit) => {
      observer.notify(fruit)
    })

    // then
    expect(spy).toHaveBeenCalledTimes(fruits.length)
  })
})
