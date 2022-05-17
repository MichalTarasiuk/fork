export const createRef = <TValue>(initialValue: TValue) => {
  const ref = {
    current: initialValue,
  }

  const setRef = (value: TValue) => {
    ref.current = value
  }

  return { ref, setRef }
}
