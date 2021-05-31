const { validate } = require('superstruct');
const { createIndex, listDocuments, setMapping } = require('./src/elasticsearch');
const { checkDocument, checkNode } = require('./src/matcher');
const { OptionsStruct } = require('./src/types');

/**
 * Hooks into Gatsby's build process. This function fetches and parses the data to synchronise with AWS Elasticsearch.
 */
exports.createPagesStatefully = async ({ graphql, reporter }, rawOptions) => {
  if (!rawOptions || !rawOptions.enabled) {
    return reporter.info('Skipping synchronisation with Elasticsearch');
  }

  const [error, validatedOptions] = validate(rawOptions, OptionsStruct);
  if (error || !validatedOptions) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Invalid or missing options:', error);
  }

  const options = validatedOptions;

  const { errors, data } = await graphql(options.query);
  if (errors) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Failed to run query:', errors);
  }

  try {
    if (options.provider !== 'elastic.co') {
      // elastic.co just uses 'documents' and doesn't accept other indexes/mappings
      await createIndex(options);
      await setMapping(options);
    }

    const nodes = options.selector(data).map((node) => options.toDocument(node));
    const documents = await listDocuments(options);

    await Promise.all(nodes.map((node) => checkNode(node, documents, options)));
    await Promise.all(documents.map((document) => checkDocument(document, nodes, options)));
  } catch (error) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Failed to synchronise with Elasticsearch:', error);
  }
};
