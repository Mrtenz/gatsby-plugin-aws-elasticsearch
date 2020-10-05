# gatsby-plugin-aws-elasticsearch

![Version](https://img.shields.io/npm/v/gatsby-plugin-aws-elasticsearch) ![License](https://img.shields.io/github/license/Mrtenz/gatsby-plugin-aws-elasticsearch)

An experimental plugin for Gatsby to synchronise content between Gatsby and AWS Elasticsearch. You can write a GraphQL query to fetch the data, and parse it to a format which will be used for Elasticsearch.

## Requirements

* Node.js v10 or newer.
* An AWS Elasticsearch instance, and API credentials for it.

## Installation

First, install the package using `npm` or `yarn`.

```
yarn add -D gatsby-plugin-aws-elasticsearch
```

or

```
npm install --save-dev gatsby-plugin-aws-elasticsearch
```

## Getting started

To use the plugin, add it to your `gatsby-config.js`:

```js
export default {
  // ...
  plugins: [
    {
      resolve: 'gatsby-plugin-aws-elasticsearch',
      options: {
        // See below
      }
    }
  ]
}
```

### Options

The following options are available:

* `enabled` - Whether the plugin is enabled or not. Can be used to toggle the synchronisation. This defaults to false.
  ```js
  {
    enabled: !!process.env.ELASTIC_SYNC
  }
  ```

* `query` - A GraphQL query to fetch the data.
  ```js
  {
    query: `
      query {
        allMdx {
          nodes {
            frontmatter {
              title
            }
            excerpt
          }
        }
      }
    `
  }
  ```

* `selector` - A function which takes the raw GraphQL data and returns the nodes to process.
  ```js
  {
    selector: (data) => data.allMdx.nodes
  }
  ```

* `toDocument` - A function which takes a single node (from `selector`), and returns an object with the data to insert into Elasticsearch. The object must contain an `id` field, which is used as the ID for the document. Note that the data should be JSON serialisable.
  ```js
  {
    toDocument: (node) => ({
      id: node.slug,
      title: node.frontmatter.title,
      excerpt: node.excerpt
    })
  }
  ```

* `endpoint` - The HTTP endpoint of the Elasticsearch server. It should not have a trailing slash.
  ```js
  {
    endpoint: process.env.ELASTIC_AWS_ENDPOINT
  }
  ```

* `index` - The name of the index to insert the data into.
  ```js
  {
    index: 'articles'
  }
  ```

* `accessKeyId` - The AWS IAM access key ID.
  ```js
  {
    endpoint: process.env.ELASTIC_AWS_ACCESS_KEY_ID
  }
  ```

* `secretAccessKey` - The AWS IAM secret access key.
  ```js
  {
    endpoint: process.env.ELASTIC_AWS_SECRET_ACCESS_KEY
  }
  ```
