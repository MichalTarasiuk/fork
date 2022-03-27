import { renderHook } from '@testing-library/react-hooks'

import { useHasMounted } from '../../src/hooks/hooks'

describe('useHasMounted', () => {
  it('should return true if component is mounted', () => {
    // arrange
    const { result } = renderHook(() => useHasMounted())

    // assert
    expect(result.current.isMounted).toBeTruthy()
  })

  it('should return false if component is unmounted', () => {
    // given
    const { unmount, result } = renderHook(() => useHasMounted())

    // when
    unmount()

    // then
    expect(result.current.isMounted).toBeFalsy()
  })
})
