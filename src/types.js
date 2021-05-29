const { array, boolean, defaulted, func, number, object, optional, record, string } = require('superstruct');

const OptionsStruct = defaulted(
  object({
    enabled: optional(boolean()),
    query: string(),
    selector: func(),
    toDocument: func(),
    endpoint: string(),
    index: string(),

    accessKeyId: string(),
    secretAccessKey: string(),

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
    enabled: false
  }
);

module.exports = { OptionsStruct };
