import { createStash } from '../../src/logic/logic'

describe('createStash', () => {
  const stash = createStash<Record<PropertyKey, unknown>>('test')

  afterEach(() => {
    stash.clear()
  })

  it('should save and read a value', () => {
    // given
    const value = { foo: 'bar' }

    // when
    stash.save(value)

    // then
    expect(stash.read()).toEqual({
      success: true,
      current: value,
    })
  })

  it('should clear the value', () => {
    // given
    const value = { foo: 'bar' }

    // when
    stash.save(value)
    stash.clear()

    // then
    expect(stash.read()).toEqual({
      success: false,
      error: new Error('Item with key "test" does not exist'),
    })
  })
})
