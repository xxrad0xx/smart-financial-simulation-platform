export function toJsonString(value) {
  return JSON.stringify(value ?? [])
}

export function fromJsonString(raw, fallback) {
  try {
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

