import { renderHook, act } from '@testing-library/react-hooks'

import { useListener } from '../../src/hooks/hooks'

describe('useListener', () => {
  it('should invoke observer on create hook', () => {
    // arrange
    const initialState = {
      foo: 'bar',
    }
    const actions = {}
    const observer = jest.fn().mockImplementation((_, nextState) => nextState)

    renderHook(() => useListener(initialState, actions, observer))

    // assert
    expect(observer.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          undefined,
          Object {
            "foo": "bar",
            Symbol(sync): Object {},
            Symbol(async): Object {},
          },
        ],
      ]
    `)
  })

  it('should invoke observer on listener call', () => {
    // given
    const initialState = {
      foo: 'bar',
    }
    const actions = {}
    const observer = jest.fn().mockImplementation((_, nextState) => nextState)

    const {
      result: { current: hook },
    } = renderHook(() => useListener(initialState, actions, observer))
    const [, listener] = hook

    // when
    act(() => {
      listener({ foo: 'bar' }, { foo: 'baz' })
    })

    // then
    expect(observer).toHaveBeenCalledTimes(2)
  })

  it('component should not rerender on listenr call when is unmounted', () => {
    // given
    const initialState = {
      foo: 'bar',
    }
    const actions = {}
    const spy = jest.fn()

    const {
      result: { current: hook },
      unmount,
    } = renderHook(() => {
      spy()

      return useListener(initialState, actions, (_, nextState) => nextState)
    })
    const [, listener] = hook

    // when
    unmount()
    listener({ foo: 'bar' }, { foo: 'baz' })

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
