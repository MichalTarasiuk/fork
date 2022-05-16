import { createRef } from '../../src/utils/utils'

describe('createRef', () => {
  it('should null be as initial value', () => {
    // arrange
    const { ref } = createRef()

    // assert
    expect(ref.current).toBe(null)
  })

  it('should set value to empty array', () => {
    // when
    const { ref, setRef } = createRef<[]>()

    // then
    setRef([])

    // then
    expect(ref.current).toEqual([])
  })
})
