export function getUserAgent (headers) {
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === 'user-agent') {
      return headers[key]
    }
  }
  return ''
}
