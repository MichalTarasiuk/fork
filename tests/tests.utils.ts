export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const ignoreReact18Error = () => {
  const originalError = console.error

  beforeAll(() => {
    console.error = (...args) => {
      const regex =
        /Warning: ReactDOM.render is no longer supported in React 18./

      if (regex.test(args[0])) {
        return
      }

      originalError.call(console, ...args)
    }
  })

  afterAll(async () => {
    console.error = originalError
  })
}
