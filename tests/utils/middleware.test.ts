import {
  isMiddleware,
  invokeMiddlewares,
  getMiddlewares,
} from '../../src/utils'

describe('isMiddleware', () => {
  it('should return true when function has default params', () => {
    // arrange
    // @ts-ignore
    const middleware = (value = 0, divider = 1) => ({ next: true, value })

    // assert
    expect(isMiddleware(middleware)).toBeTruthy()
  })

  it('should return false when function has one constant param', () => {
    // arrange
    // @ts-ignore
    const middleware = (divider, value = 0) => ({ next: true, value })

    // assert
    expect(isMiddleware(middleware)).toBeFalsy()
  })

  it('should return false when function does not have any params', () => {
    // arrange
    const middleware = () => ({ next: true, value: undefined })

    // assert
    expect(isMiddleware(middleware)).toBeFalsy()
  })

  it('should return false when value is not a function', () => {
    // arrange
    const middleware = null

    // assert
    expect(isMiddleware(middleware)).toBeFalsy()
  })
})

describe('getMiddlewares', () => {
  it('should pick middlewares', () => {
    // arrange
    const value = {
      middleware: (value = 0) => value,
      value: 0,
    }
    const result = getMiddlewares(value)

    // assert
    expect(result).toMatchInlineSnapshot(`
      Object {
        "middleware": [Function],
      }
    `)
  })
})

describe('invokeMiddlewares', () => {
  it('should use default value of middlewares when state is not initialized', () => {
    // given
    const state = {
      counter: (value = 0) => {
        if (value > 10) {
          return { next: true, value }
        }

        return { next: false, value }
      },
      value: 0,
    }

    // when
    const middlewares = getMiddlewares(state)

    // then
    expect(middlewares).toMatchInlineSnapshot(`
      Object {
        "counter": [Function],
      }
    `)

    // when
    const result = invokeMiddlewares(middlewares, state)

    // then
    expect(result).toEqual({ counter: 0, value: 0 })
  })

  it('should apply new value when next of middleware is truthy', () => {
    // given
    const value = {
      counter: (value = 0) => ({ next: true, value }),
      value: 0,
    }

    // when
    const middlewares = getMiddlewares(value)

    // then
    expect(middlewares).toMatchInlineSnapshot(`
      Object {
        "counter": [Function],
      }
    `)

    // when
    const state = invokeMiddlewares(middlewares, value)

    // then
    expect(state).toEqual({ counter: 0, value: 0 })

    // when
    const newValue = {
      counter: 1,
      value: 0,
    }
    // @ts-ignore
    const updatedState = invokeMiddlewares(middlewares, value, newValue)

    // then
    expect(updatedState).toEqual(newValue)
  })

  it('should not apply new value when next of middleware is falsy', () => {
    // given
    const value = {
      counter: (value = 0) => ({ next: false, value }),
      value: 0,
    }

    // when
    const middlewares = getMiddlewares(value)

    // then
    expect(middlewares).toMatchInlineSnapshot(`
      Object {
        "counter": [Function],
      }
    `)

    // when
    const state = invokeMiddlewares(middlewares, value)

    // then
    expect(state).toEqual({ counter: 0, value: 0 })

    // when
    const newValue = {
      counter: 1,
      value: 0,
    }
    // @ts-ignore
    const updatedState = invokeMiddlewares(middlewares, state, newValue)

    // then
    expect(updatedState).toEqual(state)
  })
})
