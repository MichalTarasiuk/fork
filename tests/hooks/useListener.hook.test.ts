import { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { wait } from '../tests.utils'
import { useListener } from '../../src/hooks/hooks'

const mockUser = {
  name: 'John',
  surname: 'Doe',
  age: 20,
  getAge: () => Promise.resolve(20),
  getName: () => Promise.resolve('John'),
  getSurname: () => Promise.resolve('Doe'),
}

async function getUser() {
  await wait(1000)

  return mockUser
}

describe('useListener', () => {
  it('should invoke observer on each update mind', () => {
    // given
    const observer = jest.fn().mockImplementation((state) => state)
    const { result: hook } = renderHook(() => useListener({ a: 1 }, observer))

    // when
    act(() => {
      const listener = hook.current[1]
      listener({ a: 2 }, { a: 1 })
    })

    // then
    expect(observer).toHaveBeenCalledTimes(2)

    // when
    act(() => {
      const listener = hook.current[1]
      listener({ a: 3 }, { a: 2 })
    })

    // then
    expect(observer).toHaveBeenCalledTimes(3)
  })

  it('should update mind on listener call', () => {
    // given
    const { result: hook } = renderHook(() =>
      useListener({ a: 1 }, (state) => state)
    )

    // when
    act(() => {
      const listener = hook.current[1]
      listener({ a: 2 }, { a: 1 })
    })

    // then
    const mind = hook.current[0]
    expect(mind).toEqual({ a: 2 })
  })

  it('should not update mind on listener call when component is not mounted', () => {
    // given
    const { result: hook, unmount } = renderHook(() =>
      useListener({ a: 1 }, (state) => state)
    )

    // when
    act(() => {
      unmount()
      const listener = hook.current[1]
      listener({ a: 2 }, { a: 1 })
    })

    // then
    const mind = hook.current[0]
    expect(mind).toEqual({ a: 1 })
  })

  it('should generate status for async action', () => {
    // when
    const { result: hook } = renderHook(() =>
      useListener(
        {
          getUser,
        },
        (state) => state
      )
    )

    // then
    const mind = hook.current[0]
    expect(mind).toMatchInlineSnapshot(`
      Object {
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should update mind on invoke async action', async () => {
    // given
    const { result: hook } = renderHook(() =>
      useListener(
        {
          getUser,
        },
        (state) => state
      )
    )

    // when
    await act(async () => {
      const mind = hook.current[0]
      const [getUser] = mind.getUser

      await getUser()
    })

    // then
    const mind = hook.current[0]
    expect(mind).toMatchInlineSnapshot(`
      Object {
        "getUser": Array [
          [Function],
          "success",
        ],
      }
    `)
  })

  it('async slice should be the same after update mind', () => {
    // given
    const { result: hook } = renderHook(() =>
      useListener({ a: 1, getUser }, (state) => state)
    )

    // when
    act(() => {
      const listener = hook.current[1]
      listener({ a: 2, getUser }, { a: 1, getUser })
    })

    // then
    const mind = hook.current[0]
    expect(mind).toMatchInlineSnapshot(`
      Object {
        "a": 2,
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should not rerender on generate status for new async action', () => {
    // given
    const object = {
      getUser,
    }
    const renderSpy = jest.fn()
    const { result } = renderHook(() => {
      const [state, setState] = useState<Partial<typeof object>>({})
      const hook = useListener(state, (state) => state)

      renderSpy()

      const update = () => {
        setState(object)
      }

      return { hook, update }
    })

    // when
    act(() => {
      const { update } = result.current
      update()
    })

    // then
    const mind = result.current.hook[0]
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(mind).toMatchInlineSnapshot(`
      Object {
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })
})