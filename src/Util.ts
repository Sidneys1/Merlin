export function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = (Object.values(anEnum as Object).filter(v => typeof v === 'number') as unknown) as T[keyof T][];
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }