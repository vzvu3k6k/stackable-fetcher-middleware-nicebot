import robotsParser from 'robots-parser'
import urlUtil from 'url'
import RobotsError from './robots_error'
import StackableFetcher from 'stackable-fetcher'
import { getUserAgent } from './util'

export class RobotsTxt {
  constructor (application, options = {}) {
    this.application = application
    this.robotsTxt = Object.create(null)

    if (options.fetcher) {
      this.fetcher = options.fetcher
    } else {
      this.fetcher = new StackableFetcher({
        adapter: this.application
      })
    }
  }

  async call (environment) {
    if (await this.isDisallowed(environment)) {
      throw new RobotsError(
        `Accessing ${environment.url} is disallowed by robots.txt.`
      )
    }
    return this.application.call(environment)
  }

  async isDisallowed (environment) {
    const robotsTxtUrl = urlUtil.resolve(environment.url, '/robots.txt')
    const checker = await this.fetchChecker(robotsTxtUrl)
    return checker.isDisallowed(
      environment.url, getUserAgent(environment.headers)
    )
  }

  async fetchChecker (url) {
    if (this.robotsTxt[url]) return this.robotsTxt[url]

    const response = await this.fetcher.get(url)

    switch (response.status) {
      case 200:
        return (this.robotsTxt[url] = robotsParser(url, response.body))
      case 404:
        return (this.robotsTxt[url] = robotsParser(url, ''))
      default:
        throw new RobotsError(
          `GET /robots.txt: status code was ${response.status}.`
        )
    }
  }
}

export default RobotsTxt
