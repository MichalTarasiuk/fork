import { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { useAsync } from '../../src/hooks/hooks'
import { wait } from '../tests.utils'
import type { AsyncFunction } from '../../src/typings/typings'

const mockUser = {
  name: 'John',
  surname: 'Doe',
  age: 20,
  getAge: () => Promise.resolve(20),
  getName: () => Promise.resolve('John'),
  getSurname: () => Promise.resolve('Doe'),
}
const object = {
  async getUser() {
    await wait(1000)

    return mockUser
  },
}

describe('useAsync', () => {
  it('should generate status for async action', () => {
    // arrange
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, () => {}))

    // assert
    expect(hook.current).toMatchInlineSnapshot(`
      Object {
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should invoke callback', async () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, callback))

    // when
    const [getUser] = hook.current.getUser

    // when
    await getUser()

    // then
    expect(callback).toHaveBeenCalled()
  })

  it('should return update async slice', async () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, callback))

    // when
    const [getUser] = hook.current.getUser

    // when
    await getUser()

    // then
    const [, status] = hook.current.getUser
    expect(status).toBe('success')
  })

  it('should generate hook state after remove some props', () => {
    // given
    const {
      result: { current: hook },
    } = renderHook(() => {
      const [state, setState] = useState<Partial<typeof object>>(object)
      const async = useAsync(state, () => {})

      const update = () => {
        setState({})
      }

      return { async, update }
    })

    // when
    act(() => {
      hook.update()
    })

    // then
    expect(hook.async.current).toEqual({})
  })

  it('should generate hook state after add some props', () => {
    // given
    const {
      result: { current: hook },
    } = renderHook(() => {
      type State = typeof object & { getName?: AsyncFunction }
      const [state, setState] = useState<State>(object)
      // @ts-ignore
      const async = useAsync(state, () => {})

      const update = () => {
        const getName = async () => {
          await wait(1000)

          return 'John'
        }
        setState((prevState) => ({ ...prevState, getName }))
      }

      return { async, update }
    })

    // when
    act(() => {
      hook.update()
    })

    // then
    expect(hook.async.current).toMatchInlineSnapshot(`
      Object {
        "getName": Array [
          [Function],
          "idle",
        ],
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should generate status only for async action', () => {
    // arrange
    const {
      result: { current: hook },
      // @ts-ignore
    } = renderHook(() => useAsync({ getName: () => 'John' }, () => {}))

    // then
    expect(hook.current).toEqual({})
  })
})
