import RobotsTxt from './robots_txt'
import XRobotsTag from './x_robots_tag'
import MetaRobotsTag from './meta_robots_tag'

export default class Nicebot {
  constructor (application, options = {}) {
    let directives = {}
    if (options.directives) {
      directives = { directives: options.directives }
    }
    let getMetaTags = {}
    if (options.getMetaTags) {
      getMetaTags = { getMetaTags: options.getMetaTags }
    }

    const robotsTxt = new RobotsTxt(application, options.robotsTxt)
    const xRobotsTag = new XRobotsTag(
      robotsTxt,
      Object.assign({}, directives, options.xRobotsTag)
    )
    const metaRobotsTag = new MetaRobotsTag(
      xRobotsTag,
      Object.assign({}, directives, getMetaTags, options.metaRobotsTag)
    )

    return metaRobotsTag
  }
}

export { default as RobotsError } from './robots_error'
export { Nicebot, RobotsTxt, XRobotsTag, MetaRobotsTag }
