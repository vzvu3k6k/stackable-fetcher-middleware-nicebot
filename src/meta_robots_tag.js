import RobotsError from './robots_error'
import RobotDirectives from 'robot-directives'
import { getUserAgent } from './util'

export default class MetaRobotsTag {
  constructor (application, options = {}) {
    this.application = application

    if (!options.getMetaTags) {
      throw new Error('getMetaTags is missing.')
    }
    this.getMetaTags = options.getMetaTags
    this.directives = options.directives || RobotDirectives.ALL
  }

  async call (environment) {
    const response = await this.application.call(environment)
    let metaTags = this.getMetaTags(response)
    if (typeof metaTags.then === 'function') {
      metaTags = await metaTags
    }
    const checker = new RobotDirectives({
      userAgent: getUserAgent(environment.headers)
    })
    for (const [name, content] of metaTags) {
      checker.meta(name, content)
    }
    if (checker.isNot(this.directives)) {
      const error = new RobotsError(
        `Accessing ${environment.url} is disallowed by robots meta tags.`
      )
      error.response = response
      throw error
    }
    return response
  }
}
