import { renderHook } from '@testing-library/react-hooks'

import { useMerge } from '../../src/hooks/hooks'

describe('useMerge', () => {
  it('should merge next object to previous object on each rerender', () => {
    // given
    const {
      result: { current: hook },
      rerender,
    } = renderHook((props) => useMerge(props), {
      initialProps: { a: 1, b: 2 } as Record<PropertyKey, number>,
    })

    // when
    rerender({ c: 1 })

    // then
    expect(hook.current).toEqual({ a: 1, b: 2, c: 1 })
  })
})
