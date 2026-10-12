export function _nullProto<T extends object>(obj: T): T {
  return Object.assign(Object.create(null), obj);
}
