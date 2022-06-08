import { renderHook } from '@testing-library/react-hooks'

import { useHasMounted } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

describe('useHasMounted', () => {
  ignoreReact18Error()

  it('should return true if component is mounted', () => {
    // arrange
    const {
      result: { current: hook },
    } = renderHook(() => useHasMounted())

    // assert
    expect(hook.current).toBeTruthy()
  })

  it('should return false if component is unmounted', () => {
    // given
    const {
      unmount,
      result: { current: hook },
    } = renderHook(() => useHasMounted())

    // when
    unmount()

    // then
    expect(hook.current).toBeFalsy()
  })

  it('should return true if component is re-rendered', () => {
    // given
    const {
      rerender,
      result: { current: hook },
    } = renderHook(() => useHasMounted())

    // when
    rerender()

    // then
    expect(hook.current).toBeTruthy()
  })
})
