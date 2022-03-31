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

  const id = window.location.hostname
  const storage = window.localStorage

  const save = (value: TValue) => {
    storage.setItem(id, JSON.stringify(value))
  }

  const read = (): Deserialized => {
    const item = localStorage.getItem(id)

    if (item === null) {
      return {
        success: false,
        error: new Error(`Item with key "${id}" does not exist`),
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
        error: new Error(`Unable to parse item with key "${id}"`),
      }
    }
  }

  return { save, read }
}
