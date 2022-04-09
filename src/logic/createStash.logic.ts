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

export const createStash = <TValue>() => {
  type Deserialized =
    | { success: true; value: TValue }
    | { success: false; error: Error }

  const name = window.location.hostname
  const storage = window.localStorage

  const save = (value: TValue) => {
    try {
      storage.setItem(name, JSON.stringify(value))

      return value
    } catch {
      return null
    }
  }

  const clear = () => {
    storage.clear()
  }

  const read = (): Deserialized => {
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
        value: JSON.parse(item),
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
