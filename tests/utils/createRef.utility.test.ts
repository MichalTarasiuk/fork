import { createRef } from '../../src/utils/utils'

describe('createRef', () => {
  it('should null be as initial value', () => {
    // arrange
    const { ref } = createRef(null)

    // assert
    expect(ref.current).toBe(null)
  })

  it('should set value to empty array', () => {
    // when
    const { ref, setRef } = createRef<[] | null>(null)

    // then
    setRef([])

    // then
    expect(ref.current).toEqual([])
  })
})
