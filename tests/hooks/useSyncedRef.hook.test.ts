import { renderHook } from '@testing-library/react-hooks'

import { useSyncedRef } from '../../src/hooks/hooks'

describe('useSyncedRef', () => {
  it('should update value on each rerender', () => {
    // given
    type Props = { value: number }
    const {
      result: { current: ref },
      rerender,
    } = renderHook((props: Props) => useSyncedRef(props.value), {
      initialProps: {
        value: 0,
      },
    })

    // when
    rerender({ value: 1 })
    rerender({ value: 2 })
    rerender({ value: 3 })

    // then
    expect(ref.current).toBe(3)
  })

  it('should throw on attempt to change ref', () => {
    // arrange
    const { result } = renderHook(() => useSyncedRef(1))

    // assert
    expect(() => {
      // @ts-expect-error  irrelevant usage
      result.current.current = 2
    }).toThrow(
      new TypeError(
        'Cannot set property current of #<Object> which has only a getter'
      )
    )
  })

  it('should throw on attempt to add property to return value', () => {
    // arrange
    const { result } = renderHook(() => useSyncedRef(1))

    // assert
    expect(() => {
      // @ts-expect-error testing irrelevant usage
      result.current.foo = 2
    }).toThrow(
      new TypeError('Cannot add property foo, object is not extensible')
    )
  })
})
