import { renderHook } from '@testing-library/react-hooks'

import { useFirstMount } from '../../src/hooks/hooks'

describe('useFirstMount', () => {
  it('should return boolean', () => {
    // arrange
    const { result } = renderHook(() => useFirstMount())

    // assert
    expect(result.current).toEqual(expect.any(Boolean))
  })

  it('should return true on first render and false on all others', () => {
    // given
    const { result, rerender } = renderHook(() => useFirstMount())

    // then
    expect(result.current).toBe(true)

    // when
    rerender()

    // then
    expect(result.current).toBe(false)
  })
})
