const {
  array,
  assign,
  boolean,
  defaulted,
  dynamic,
  enums,
  func,
  number,
  object,
  optional,
  record,
  string,
  union
} = require('superstruct');

const OptionsStructBase = defaulted(
  object({
    enabled: optional(boolean()),
    provider: optional(enums(['aws', 'elastic.co', 'vanilla'])),
    query: string(),
    selector: func(),
    toDocument: func(),
    endpoint: string(),
    index: string(),

    mapping: record(
      string(),
      object({
        type: string(),
        index: optional(boolean()),
        boost: optional(number())
      })
    ),

    // Gatsby includes a plugins array by default
    plugins: array()
  }),
  {
    enabled: false,
    provider: 'vanilla'
  }
);

// @elastic/elasticsearch
// https://github.com/elastic/elasticsearch-js/blob/6464fc6/lib/pool/index.d.ts#L50-L57
const AuthApiKeyAuth = object({
  apiKey: union([string(), object({ id: string(), api_key: string() })])
});

// @elastic/elasticsearch
// https://github.com/elastic/elasticsearch-js/blob/6464fc6/lib/pool/index.d.ts#L59-L62
const BasicAuth = object({
  username: string(),
  password: string()
});

// @elastic/elasticsearch: Either option
const ESAuth = union([AuthApiKeyAuth, BasicAuth]);

const OptionsStructElasticCo = assign(OptionsStructBase, object({ auth: ESAuth }));

// @elasticsearch + aws adapter
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
const AWSAuth = object({
  accessKeyId: string(),
  secretAccessKey: string(),
  sessionToken: optional(string()),
  credentialsProvider: optional(object()),
  maxRetries: optional(number()),
  maxRedirects: optional(number()),
  sslEnabled: optional(boolean())
});

const OptionsStructAWS = assign(OptionsStructBase, object({ auth: AWSAuth }));
const OptionsStructDefault = assign(OptionsStructBase, object({ auth: optional(ESAuth) }));

const DEFAULT_OPTIONS = OptionsStructDefault;

const OptionsStruct = dynamic((options) => {
  console.log(options.provider);
  switch (options.provider) {
    case 'aws':
      return OptionsStructAWS;
    case 'elastic.co':
      return OptionsStructElasticCo;
    case 'vanilla':
      return OptionsStructBase;
    default:
      return DEFAULT_OPTIONS;
  }
});

module.exports = { OptionsStruct };
