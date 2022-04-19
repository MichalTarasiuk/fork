import { inferRefObject } from '../../src/helpers/helpers'

describe('inferRefObject', () => {
  it('should infer a RefObject', () => {
    // arrange
    const refObject = { current: 'foo' }

    // assert
    expect(inferRefObject(refObject)).toBe(refObject.current)
  })

  it('should infer a plain object', () => {
    // arrange
    const plainObject = { foo: 'bar' }

    // assert
    expect(inferRefObject(plainObject)).toBe(plainObject)
  })

  it('should infer a primitive', () => {
    expect(inferRefObject('foo')).toBe('foo')
  })
})
