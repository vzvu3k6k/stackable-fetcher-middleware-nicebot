# stackable-fetcher-middleware-nicebot

Middlewares for [stackable-fetcher](https://www.npmjs.com/package/stackable-fetcher) to follow robot exclusion.

The following protocols are supported:

- robots.txt (`User-agent:`, `Allow:` and `Disallow:`)
  - powered by [robots-parser](https://www.npmjs.com/package/robots-parser)
  - While robots-parser supports `Crawl-delay:` and `Host:`, nicebot hasn't supported them yet.
- robots meta tags
  - powered by [robot-directives](https://www.npmjs.com/package/robot-directives)
  - nicebot and robot-directives are not responsible for parsing HTML.
- X-Robots-Tag HTTP headers
  - powered by [robot-directives](https://www.npmjs.com/package/robot-directives)

This package exports `Nicebot` middleware as default, which supports all of robots.txt, robots meta tags and X-Robots-Tag HTTP headers.

Also, sub-middlewares of `RobotsTxt`, `MetaRobotsTag` and `XRobotsTag` are provided, which support robots.txt, robots meta tags and X-Robots-Tag HTTP headers respectively.

<!-- npm i -g doctoc; doctoc README.md -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
  - [Nicebot](#nicebot)
    - [Options](#options)
  - [RobotsTxt](#robotstxt)
    - [Options](#options-1)
  - [MetaRobotsTag](#metarobotstag)
    - [Options](#options-2)
  - [XRobotsTag](#xrobotstag)
    - [Options](#options-3)
- [Development](#development)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Usage

### Nicebot

``` javascript
import StackableFetcher from 'stackable-fetcher'
import Nicebot from 'stackable-fetcher-middleware-nicebot'
import cheerio from 'cheerio'

var fetcher = new StackableFetcher().use(
  Nicebot, { getMetaTags }
)
var params = {}
var headers = { 'user-agent': 'doodlebot' }
fetcher.get('http://example.com/', params, headers)
  .then((response) => console.log('ok', response),
        (err) => console.log('fail', err.stack))

function getMetaTags (response) {
  var contentType = response.headers.get('content-type')
  if (contentType && /^text\/html(;|$)/.test(contentType)) {
    var $ = cheerio.load(response.body)
    var metaTags = []
    $('meta[name][content]').each(function () {
      metaTags.push([$(this).attr('name'), $(this).attr('content')])
    })
    return metaTags
  }
  return []
}
```

User-Agent is taken from `user-agent` field of headers (case-insensitive).

#### Options

- `directives`: [Directives of robot-directives](https://www.npmjs.com/package/robot-directives#constants). Passed to `MetaRobotsTag` and `XRobotsTag`.
- `getMetaTags`: Added to options for `MetaRobotsTag`.
- `robotsTxt`: Passed to `RobotsTxt`.
- `metaRobotsTag`: Passed to `MetaRobotsTag`.
- `xRobotsTag`: Passed to `XRobotsTag`.

### RobotsTxt

Before sending a request, RobotsTxt fetches robots.txt and rejects with `RobotsError` if the request to be sent is disallowed by robots.txt.

To fetch robots.txt, RobotsTxt uses the receiver of `use` by default.

``` javascript
import { RobotsTxt } from 'stackable-fetcher-middleware-nicebot'
var baseFetcher = new StackableFetcher()

// baseFetcher is used to fetch robots.txt.
var myCrawler = baseFetcher.use(RobotsTxt)
```

#### Options

- `fetcher`: Specify a stackable-fetcher instance to fetch robots.txt.

``` javascript
var baseFetcher = new StackableFetcher()
var subFetcher = new StackableFetcher()

// subFetcher is used to fetch robots.txt.
var myCrawler = baseFetcher.use(
  RobotsTxt, { fetcher: subFetcher }
)
```

### MetaRobotsTag

MetaRobotsTag rejects with `RobotsError` if meta robots tags disallows your crawler.

`RobotsError` from this middleware contains the response as `response` property.

#### Options

- `getMetaTags`: [Required] A function takes a HTTP response and returns an array of ``[`name` attribute", `content` attribute]`` of each meta tags.

``` javascript
import StackableFetcher from 'stackable-fetcher'
import { MetaRobotsTag } from 'stackable-fetcher-middleware-nicebot'
import cheerio from 'cheerio' // HTML scraper

var fetcher = new StackableFetcher().use(
  MetaRobotsTag, { getMetaTags }
)
var params = {}
var headers = { 'user-agent': 'doodlebot' }
fetcher.get('http://example.com/', params, headers)
  .then((response) => console.log('ok', response),
        (err) => console.log('fail', err.stack))

function getMetaTags (response) {
  var contentType = response.headers.get('content-type')
  if (contentType && /^text\/html(;|$)/.test(contentType)) {
    var $ = cheerio.load(response.body)
    var metaTags = []
    $('meta[name][content]').each(function () {
      metaTags.push([$(this).attr('name'), $(this).attr('content')])
    })
    return metaTags
  }
  return [] // If it is not HTML, just returns an empty array.
}
```

- `directives`: [Directives of robot-directives](https://www.npmjs.com/package/robot-directives#constants). The default value is `RobotDirectives.ALL`.

### XRobotsTag

XRobotsTag rejects with `RobotsError` if `X-Robots-Tag` HTTP headers disallows your crawler.

`RobotsError` from this middleware contains the response as `response` property.

#### Options

- `directives`: [Directives of robot-directives](https://www.npmjs.com/package/robot-directives#constants). The default value is `RobotDirectives.ALL`.

## Development

- Run test: `npm test`
- Update ToC in README.md: `doctoc README.md` (doctoc is not included in devDependencies. Run `npm install -g doctoc` first.)
