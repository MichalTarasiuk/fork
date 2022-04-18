import { useRef } from 'react'

export const useFollow = <TValue>(
  value: TValue,
  callback: (value: TValue) => void
) => {
  const savedValue = useRef<TValue>(value)

  return {
    get current() {
      return savedValue.current
    },
    set current(value: TValue) {
      savedValue.current = value

      callback(value)
    },
  }
}
