import { createSubject, noop } from '../../src/utils/utils'

describe('createSubject', () => {
  it('should subscribe observer', () => {
    // given
    const subject = createSubject<string>()

    // when
    subject.subscribe(noop)

    // then
    expect(subject.listeners).toHaveLength(1)
  })

  it('should unsubscribe observer', () => {
    // given
    const subject = createSubject<string>()

    // when
    const subscriber = subject.subscribe(noop)

    // then
    expect(subject.listeners).toHaveLength(1)

    // when
    subscriber.unsubscribe()

    // then
    expect(subject.listeners).toHaveLength(0)
  })

  it('should notify all subscribers', () => {
    // given
    const fruits = ['apple', 'banana', 'orange', 'lemon']
    const subject = createSubject<string>()
    const spy = jest.fn()

    // when
    subject.subscribe(spy)

    // then
    expect(subject.listeners).toHaveLength(1)

    // when
    fruits.forEach((fruit) => {
      subject.notify(fruit, fruit)
    })

    // then
    expect(spy).toHaveBeenCalledTimes(fruits.length)
  })

  it('should not invoke emitter when is defined', () => {
    //given
    const subject = createSubject<string | undefined>()

    // when
    const spy1 = jest.fn()
    subject.subscribe(spy1)

    // then
    expect(subject.listeners).toHaveLength(1)

    // when
    const spy2 = jest.fn()
    subject.subscribe(spy2)

    // then
    expect(subject.listeners).toHaveLength(2)

    // when
    subject.notify('apple', undefined, spy1)

    // then
    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(1)
  })
})
