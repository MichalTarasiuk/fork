import { renderHook, act } from '@testing-library/react-hooks'

import { useForce } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

describe('useForce', () => {
  ignoreReact18Error()

  it('should rerender component on each call force function', () => {
    // given
    const rerender = jest.fn()
    const { result } = renderHook(() => {
      rerender()

      return useForce()
    })

    // when
    act(() => {
      result.current()
    })
    act(() => {
      result.current()
    })
    act(() => {
      result.current()
    })

    // then
    expect(rerender).toHaveBeenCalledTimes(4)
  })

  it('should return function', () => {
    // arrange
    const { result } = renderHook(() => useForce())

    // assert
    expect(result.current).toEqual(expect.any(Function))
  })
})
