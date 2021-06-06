# @tony/gatsby-plugin-elasticsearch-search &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tony/gatsby-plugin-elasticsearch-search/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@tony/gatsby-plugin-elasticsearch-search.svg?style=flat)](https://www.npmjs.com/package/@tony/gatsby-plugin-elasticsearch-search)

An experimental plugin for Gatsby to synchronise content between Gatsby and AWS Elasticsearch. You can write a GraphQL query to fetch the data, and parse it to a format which will be used for Elasticsearch.

## Requirements

- Node.js v12 or newer.
- An AWS Elasticsearch instance, and API credentials for it.

## Installation

First, install the package using `npm` or `yarn`.

```
yarn add -D @tony/gatsby-plugin-elasticsearch-search
```

or

```
npm install --save-dev @tony/gatsby-plugin-elasticsearch-search
```

## Getting started

To use the plugin, add it to your `gatsby-config.js`:

```js
export default {
  // ...
  plugins: [
    {
      resolve: '@tony/gatsby-plugin-elasticsearch-search',
      options: {
        // See below
      }
    }
  ]
};
```

### Options

The following options are available:

- `enabled` - Whether the plugin is enabled or not. Can be used to toggle the synchronisation. This defaults to false.

  ```js
  {
    enabled: !!process.env.ELASTIC_SYNC;
  }
  ```

- `provider`: Default `'vanilla'`

  Choices:

  - `vanilla`: No extra params
  - `aws`: Requires `awsAccessKey`, `secretAccessKey`
  - `elastic.co`: Requires `apiKey`

- `query` - A GraphQL query to fetch the data.

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
    `;
  }
  ```

- `selector` - A function which takes the raw GraphQL data and returns the nodes to process.

  ```js
  {
    selector: (data) => data.allMdx.nodes;
  }
  ```

- `toDocument` - A function which takes a single node (from `selector`), and returns an object with the data to insert into Elasticsearch. The object must contain an `id` field, which is used as the ID for the document. Note that the data should be JSON serialisable.

  ```js
  {
    toDocument: (node) => ({
      id: node.slug,
      title: node.frontmatter.title,
      excerpt: node.excerpt
    });
  }
  ```

- `endpoint` - The HTTP endpoint of the Elasticsearch server. It should not have a trailing slash.

  ```js
  {
    endpoint: process.env.ELASTIC_AWS_ENDPOINT;
  }
  ```

- `index` - The name of the index to insert the data into. If the index does not exist, it will be created.

  ```js
  {
    index: 'articles';
  }
  ```

- `mapping` - An object with the mapping info for the index. This will overwrite the current settings for the index. Please refer to [the Elasticsearch docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) for an overview of the options.

  ```js
  {
    mapping: {
      title: {
        type: 'keyword'
      },
      excerpt: {
        type: 'text'
      }
    }
  }
  ```

- `accessKeyId` - The AWS IAM access key ID. (`aws` only)

  ```js
  {
    endpoint: process.env.ELASTIC_AWS_ACCESS_KEY_ID;
  }
  ```

- `secretAccessKey` - The AWS IAM secret access key. (`aws` only)
  ```js
  {
    endpoint: process.env.ELASTIC_AWS_SECRET_ACCESS_KEY;
  }
  ```

## Credit

Fork of https://github.com/Mrtenz/gatsby-plugin-aws-elasticsearch/ /
[`gatsby-plugin-aws-elasticsearch`](https://www.npmjs.com/package/gatsby-plugin-aws-elasticsearch)

### Differences

- Rewrote in TypeScript -> Gatsby-friendly javascript
- Set providers:
  - `vanilla` - Running elasticsearch on localhost
  - `aws`
  - `elastic.co`
