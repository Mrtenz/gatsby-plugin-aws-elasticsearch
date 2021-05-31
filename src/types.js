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
  string
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
    provider: 'aws'
  }
);

const OptionsStructAWS = assign(
  OptionsStructBase,
  object({
    accessKeyId: string(),
    secretAccessKey: string()
  })
);

const OptionsStructElasticCo = assign(
  OptionsStructBase,
  object({
    apiKey: string()
  })
);

const DEFAULT_OPTIONS = OptionsStructAWS;

const OptionsStruct = dynamic((options) => {
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
