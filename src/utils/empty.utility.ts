// utility mutate the object
export function empty(object: Record<PropertyKey, unknown>) {
  Object.keys(object).forEach((key) => {
    delete object[key]
  })

  return object
}
