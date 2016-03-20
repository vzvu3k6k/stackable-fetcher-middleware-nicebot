import RobotsError from './robots_error'
import RobotDirectives from 'robot-directives'
import { getUserAgent } from './util'

export default class XRobotsTag {
  constructor (application, options = {}) {
    this.application = application
    this.directives = options.directives || RobotDirectives.ALL
  }

  async call (environment) {
    const response = await this.application.call(environment)
    const checker = new RobotDirectives({
      userAgent: getUserAgent(environment.headers)
    })
    for (const header of response.headers.getAll('x-robots-tag')) {
      checker.header(header)
    }
    if (checker.isNot(this.directives)) {
      const error = new RobotsError(
        `Accessing ${environment.url} is disallowed by X-Robots-Tag HTTP headers.`
      )
      error.response = response
      throw error
    }
    return response
  }
}
