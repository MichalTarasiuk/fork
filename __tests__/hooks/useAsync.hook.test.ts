import { renderHook } from '@testing-library/react-hooks'

import { useAsync } from '../../src/hooks/hooks'
import { wait, ignoreReact18Error } from '../tests.utils'

const mockUser = {
  name: 'John',
  surname: 'Doe',
  age: 20,
  getAge: () => Promise.resolve(20),
  getName: () => Promise.resolve('John'),
  getSurname: () => Promise.resolve('Doe'),
}

const handler = {
  async fetchUser() {
    await wait(1000)

    return mockUser
  },
  async fetchUserName() {
    await wait(1000)

    return mockUser.name
  },
}

describe('useAsync', () => {
  ignoreReact18Error()

  it('should generate status for each async action', () => {
    // arrange
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(handler, () => {}))

    // assert
    expect(hook).toMatchInlineSnapshot(`
      Object {
        "fetchUser": Array [
          [Function],
          "idle",
        ],
        "fetchUserName": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should invoke fn on each state change', async () => {
    // given
    const fn = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(handler, fn))

    // when
    const [fetchUser] = hook.fetchUser

    // when
    await fetchUser()

    // then
    expect(fn.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "fetchUser": Array [
              [Function],
              "loading",
            ],
            "fetchUserName": Array [
              [Function],
              "idle",
            ],
          },
        ],
        Array [
          Object {
            "fetchUser": Array [
              [Function],
              "success",
            ],
            "fetchUserName": Array [
              [Function],
              "idle",
            ],
          },
        ],
      ]
    `)
  })

  it('should always return stale state', async () => {
    // given
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(handler, () => {}))

    // when
    const [fetchUser, status] = hook.fetchUser

    // when
    await fetchUser()

    // then
    expect(status).toBe('idle')
  })
})
