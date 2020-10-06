import { BuildArgs } from 'gatsby';
import { validate } from 'superstruct';
import { createIndex, listDocuments, setMapping } from './elasticsearch';
import { checkDocument, checkNode } from './matcher';
import { Options, OptionsStruct } from './types';

/**
 * Hooks into Gatsby's build process. This function fetches and parses the data to synchronise with AWS Elasticsearch.
 */
export const createPagesStatefully = async ({ graphql, reporter }: BuildArgs, rawOptions: Options): Promise<void> => {
  if (!rawOptions || !rawOptions.enabled) {
    return reporter.info('Skipping synchronisation with Elasticsearch');
  }

  const [error, validatedOptions] = validate(rawOptions, OptionsStruct);
  if (error || !validatedOptions) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Invalid or missing options:', error);
  }

  const options = validatedOptions as Options;

  const { errors, data } = await graphql(options.query as string);
  if (errors) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Failed to run query:', errors);
  }

  try {
    await createIndex(options);
    await setMapping(options);

    const nodes = options.selector(data).map((node) => options.toDocument(node));
    const documents = await listDocuments(options);

    await Promise.all(nodes.map((node) => checkNode(node, documents, options)));
    await Promise.all(documents.map((document) => checkDocument(document, nodes, options)));
  } catch (error) {
    return reporter.panic('gatsby-plugin-aws-elasticsearch: Failed to synchronise with Elasticsearch:', error);
  }
};
