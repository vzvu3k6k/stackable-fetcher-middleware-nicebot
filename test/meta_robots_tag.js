import assert from 'assert'
import { rejects, stubApplication } from './helper'
import RobotsError from '../src/robots_error'
import MetaRobotsTag from '../src/meta_robots_tag'

function getMetaTags (response) {
  const metaTags = []
  response.body.replace(
      /<meta name="(.+?)" content="(.+?)">/g,
    (_, name, content) => {
      metaTags.push([name, content])
    }
  )
  return metaTags
}

describe('MetaRobotsTag', () => {
  context('when meta robots tags disallow crawling', () => {
    it('should reject with a RobotsError containing the response', () => {
      const stubResponse = {
        body: 'Hello, world. <meta name="doodlebot" content="noindex">',
        status: 200
      }
      const application = stubApplication({
        'http://example.com/': stubResponse
      })
      const middleware = new MetaRobotsTag(
        application, { getMetaTags }
      )
      const result = middleware.call({
        url: 'http://example.com/',
        headers: { 'user-agent': 'doodlebot' }
      })
      return rejects(
        result,
        RobotsError,
        'Accessing http://example.com/ is disallowed by robots meta tags.'
      ).then((err) => {
        assert.deepStrictEqual(err.response, stubResponse)
      })
    })
  })

  context('when there is no meta robot tags', () => {
    it('should allow crawling',
       async () => {
         const application = stubApplication({
           'http://example.com/': {
             body: 'Hello, world.',
             status: 200
           }
         })
         const middleware = new MetaRobotsTag(
           application, { getMetaTags }
         )
         const result = middleware.call({
           url: 'http://example.com/',
           headers: { 'user-agent': 'doodlebot' }
         })
         assert.deepStrictEqual(
           await result,
           {
             status: 200,
             body: 'Hello, world.'
           }
         )
       })
  })
})
