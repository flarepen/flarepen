let id = 0;

export function getCurrentID(): number {
  return id;
}

export function getNextID(): number {
  return ++id;
}
