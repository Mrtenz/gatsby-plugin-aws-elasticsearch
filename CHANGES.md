## [v0.3.0](https://github.com/tony/gatsby-plugin-elasticsearch-search/compare/v0.2.1...v0.3.0) (2021-06-06)

- Support normal elasticsearch
  Make `accessKeyId` / `secretAccessKey` key optional in validation schema
- Convert to ES that works out of the box with gatsby
- In params, Convert "document" -> \_document
- Update superstruct 0.10.12 -> 0.15.2
  https://github.com/ianstormtaylor/superstruct/blob/v0.15.2/Changelog.md

  Includes support for `assign()`

- Support `provider` of `vanilla`, `aws`, and `elastic.co`

  Configuration:

  - `'aws'` accepts `accessKeyId` and `secretAccessKey`
  - `'elastic.co'` accepts `apiKey`
  - `'vanilla'` doesn't use any

- Check for existing mappings, avoid errors when recreating
