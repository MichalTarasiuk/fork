import { deepPickAsyncFunctions } from '../../src/helpers/helpers'

describe('deepPickAsyncFunctions', () => {
  it('should pick async function', () => {
    // arrange
    const value = {
      counter: 1,
      async fn() {},
    }

    // assert
    expect(deepPickAsyncFunctions(value)).toMatchInlineSnapshot(`
      Object {
        "fn": [Function],
      }
    `)
  })

  it('should deep pick async function', () => {
    // arrange
    const value = {
      a: 1,
      async b() {},
      c: {
        async d() {},
        e: 'Hello',
      },
    }

    // assert
    expect(deepPickAsyncFunctions(value)).toMatchInlineSnapshot(`
      Object {
        "b": [Function],
        "c": Object {
          "d": [Function],
        },
      }
    `)
  })
})
