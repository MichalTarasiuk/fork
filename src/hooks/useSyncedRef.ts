import { useRef, useMemo } from 'react'

export const useSyncedRef = <TValue>(value: TValue) => {
  const savedValue = useRef(value)

  savedValue.current = value

  return useMemo(
    () =>
      Object.freeze({
        get current() {
          return savedValue.current
        },
      }),
    []
  )
}
