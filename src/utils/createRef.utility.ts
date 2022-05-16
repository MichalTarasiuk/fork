export const createRef = <TValue>() => {
  const ref = {
    current: null as TValue | null,
  }

  const setRef = (value: TValue) => {
    ref.current = value
  }

  return { ref, setRef }
}
