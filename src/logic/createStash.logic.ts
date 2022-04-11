type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export const createStash = () => {
  type Deserialized<TValue> =
    | { success: true; current: TValue }
    | { success: false; error: Error }

  const name = window.location.hostname
  const storage = window.localStorage

  const save = (value: unknown) => {
    storage.setItem(name, JSON.stringify(value))
  }

  const clear = () => {
    storage.clear()
  }

  const read = <TState>(): Deserialized<TState> => {
    const item = localStorage.getItem(name)

    if (item === null) {
      return {
        success: false,
        error: new Error(`Item with key "${name}" does not exist`),
      }
    }

    try {
      return {
        success: true,
        current: JSON.parse(item),
      }
    } catch (error) {
      if (error instanceof Error && isErrorWithMessage(error)) {
        return {
          success: false,
          error,
        }
      }

      return {
        success: false,
        error: new Error(`Unable to parse item with key "${name}"`),
      }
    }
  }

  return { save, read, clear }
}
