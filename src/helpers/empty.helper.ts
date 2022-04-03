export const empty = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject
): {} => {
  Object.keys(object).forEach((key) => {
    delete object[key]
  })

  return object
}
