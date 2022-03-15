import { renderHook } from '@testing-library/react-hooks'

import { useIsMounted } from '../../src/hooks/hooks'

describe('useMountedState', () => {
  it('should return true if component is mounted', () => {
    // arrange
    const { result } = renderHook(() => useIsMounted())

    // assert
    expect(result.current.isMounted).toBeTruthy()
  })

  it('should return false if component is unmounted', () => {
    // given
    const { unmount, result } = renderHook(() => useIsMounted())

    // when
    unmount()

    // then
    expect(result.current.isMounted).toBeFalsy()
  })
})
