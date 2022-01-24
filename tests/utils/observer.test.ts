import { createObserver, noop } from '../../src/utils'

describe('observer', () => {
  it('should subscribe observer', () => {
    // given
    const observer = createObserver<string>()

    // when
    observer.subscribe(noop)

    // then
    expect(observer.listeners).toHaveLength(1)
  })

  it('should destroy all subscribers', () => {
    // given
    const observer = createObserver<string>()

    // when
    observer.subscribe(noop)
    observer.subscribe(noop)

    // then
    expect(observer.listeners).toHaveLength(1)

    // when
    observer.destroy()

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
      observer.notify(fruit)
    })

    // then
    expect(spy).toHaveBeenCalledTimes(fruits.length)
  })
})
