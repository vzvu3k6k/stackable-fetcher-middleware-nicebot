import assert from 'assert'
import { rejects, stubApplication } from './helper'
import RobotsError from '../src/robots_error'
import RobotsTxt from '../src/robots_txt'

describe('RobotsTxt', () => {
  context('when robots.txt disallows crawling', () => {
    it('should reject with a RobotsError',
       () => {
         const application = stubApplication({
           'http://example.com/robots.txt': {
             body: `user-agent: doodlebot
disallow: /`,
             status: 200
           },
           'http://example.com/': {
             body: 'Hello, world.',
             status: 200
           }
         })
         const middleware = new RobotsTxt(application)
         const result = middleware.call({
           url: 'http://example.com/',
           headers: { 'user-agent': 'doodlebot' }
         })
         return rejects(
           result,
           RobotsError,
           'Accessing http://example.com/ is disallowed by robots.txt.'
         )
       }
      )
  })

  context('when GET robots.txt returns 503', () => {
    it('should reject with a RobotsError',
       () => {
         const application = stubApplication({
           'http://example.com/robots.txt': {
             status: 503
           },
           'http://example.com/': {
             body: 'Hello, world.',
             status: 200
           }
         })
         const middleware = new RobotsTxt(application)
         const result = middleware.call({
           url: 'http://example.com/',
           headers: { 'user-agent': 'doodlebot' }
         })
         return rejects(
           result,
           RobotsError,
           'GET /robots.txt: status code was 503.'
         )
       }
      )
  })

  context('when robots.txt is not found', () => {
    it('should allow crawling ',
       async () => {
         const application = stubApplication({
           'http://example.com/robots.txt': {
             status: 404
           },
           'http://example.com/': {
             body: 'Hello, world.',
             status: 200
           }
         })
         const middleware = new RobotsTxt(application)
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
