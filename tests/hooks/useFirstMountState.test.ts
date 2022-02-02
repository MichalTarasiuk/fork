import { renderHook } from '@testing-library/react-hooks'

import { useFirstMountState } from "src/hooks"

describe('useFirstMountState', () => {
  it('should return boolean', () => {
    // arrange
    const { result } = renderHook(() => useFirstMountState())

    // assert
    expect(result.current).toEqual(expect.any(Boolean))
  })

  it('should return true on first render and false on all others', () => {
    // given
    const { result, rerender } = renderHook(() => useFirstMountState())

    // then
    expect(result.current).toBe(true)

    // when
    rerender()

    // then
    expect(result.current).toBe(false)
  })
})
