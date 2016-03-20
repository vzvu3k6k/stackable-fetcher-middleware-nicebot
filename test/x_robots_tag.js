import assert from 'assert'
import { rejects, stubApplication } from './helper'
import { Headers } from 'node-fetch'
import RobotsError from '../src/robots_error'
import XRobotsTag from '../src/x_robots_tag'

describe('XRobotsTag', () => {
  context('when X-Robots-Tag disallows crawling', () => {
    it('should reject with a RobotsError containing the response',
       () => {
         const stubResponse = {
           body: 'Hello, world.',
           headers: new Headers({
             'x-robots-tag': 'doodlebot: noindex'
           }),
           status: 200
         }
         const application = stubApplication({
           'http://example.com/': stubResponse
         })
         const middleware = new XRobotsTag(application)
         const result = middleware.call({
           url: 'http://example.com/',
           headers: { 'user-agent': 'doodlebot' }
         })
         return rejects(
           result,
           RobotsError,
           'Accessing http://example.com/ is disallowed by X-Robots-Tag HTTP headers.'
         ).then((err) => {
           assert.deepStrictEqual(err.response, stubResponse)
         })
       }
      )
  })

  context('when there is not X-Robots-Tag', () => {
    it('should allow crawling',
       async () => {
         const application = stubApplication({
           'http://example.com/': {
             body: 'Hello, world.',
             headers: new Headers(),
             status: 200
           }
         })
         const middleware = new XRobotsTag(application)
         const result = await middleware.call({
           url: 'http://example.com/',
           headers: { 'user-agent': 'doodlebot' }
         })
         delete result.headers
         assert.deepStrictEqual(
           result,
           {
             status: 200,
             body: 'Hello, world.'
           }
         )
       }
      )
  })
})
