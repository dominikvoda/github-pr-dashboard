const STORAGE_KEY = 'seenPrKeys'

export function loadSeenPrKeys(): Set<string> | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) {
    return null // Never initialized — caller should seed
  }
  return new Set(JSON.parse(stored))
}

export function saveSeenPrKeys(keys: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]))
}

export function makePrKey(repository: string, number: number): string {
  return `${repository}/${number}`
}
