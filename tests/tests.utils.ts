export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const ignoreReact18Error = () => {
  const originalError = console.error

  beforeAll(() => {
    console.error = (...args) => {
      const regex =
        /Warning: ReactDOM.render is no longer supported in React 18./

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- safty check
      if (regex.test(args[0])) {
        return
      }

      originalError.call(console, ...args)
    }
  })

  afterAll(() => {
    console.error = originalError
  })
}
