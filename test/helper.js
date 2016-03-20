import assert from 'assert'

export function rejects (promise, error, message) {
  return promise.then(
    () => Promise.reject(new Error(
      `AssertionError: Missing expected exception (${error.name}). ${message}`
    )),
    (err) => {
      assert(err instanceof error, `"${err}" is not an instance of "${error}".`)
      assert.strictEqual(err.message, message)
      return err
    }
  )
}

export function stubApplication (route) {
  return {
    call (environment) {
      const response = route[environment.url]
      if (response) {
        return Promise.resolve(response)
      }
      throw new Error(`Unknown URL: ${environment.url}`)
    }
  }
}
