import { isMiddleware } from '../../src/utils'

describe('isMiddleware', () => {
  it('should return true when function has default params', () => {
    // arrange
    const middleware = (value = 0, divider = 1) => ({ next: true, value })

    // assert
    expect(isMiddleware(middleware)).toBeTruthy()
  })

  it('should return false when function has one constant param', () => {
    // arrange
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
