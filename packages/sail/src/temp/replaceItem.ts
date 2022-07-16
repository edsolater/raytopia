import { isFunction, isNumber } from '@edsolater/fnkit'

export function replaceItem<T, U>(
  arr: readonly U[],
  replaceTarget: U | ((item: U, index: number) => boolean),
  newItem: T
) {
  const index = isNumber(replaceTarget)
    ? replaceTarget
    : arr.findIndex((item, idx) => (isFunction(replaceTarget) ? replaceTarget(item, idx) : item === replaceTarget))
  if (index === -1 || index >= arr.length) return [...arr]
  return [...arr.slice(0, index), newItem, ...arr.slice(index + 1)]
}

export function replaceValue<T, K extends keyof T, V extends T[K], NewV>(
  obj: T,
  findValue: V | ((value: V, key: K) => boolean),
  replaceValue: NewV
): Record<K, V | NewV> {
  const entries = Object.entries(obj)
  const newEntries = entries.map(([key, value]) => {
    const isTargetValue = isFunction(findValue) ? findValue(value, key as any) : findValue === value
    return isTargetValue ? [key, replaceValue] : [key, value]
  })
  return Object.fromEntries(newEntries)
}
