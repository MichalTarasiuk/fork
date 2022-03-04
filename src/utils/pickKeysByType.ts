export const pickKeysByType = <TValue extends Record<string, any>>(
  value: TValue,
  type: any
) => Object.keys(value || {}).filter((key) => value[key] === type)
