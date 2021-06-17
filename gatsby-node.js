const { validate } = require('superstruct');
const { createIndex, listDocuments, setMapping, getMapping } = require('./src/elasticsearch');
const { checkDocument, checkNode } = require('./src/matcher');
const { OptionsStruct } = require('./src/types');

/**
 * Old-fashioned export way
 *
 * @param {Client} client  Elastic search JS client
 * @param {Options} options
 * @param {object} data Set of data to upload (via gatsby graphql response)
 */
const legacyUpsert = async (client, options, data) => {
  // if (options.provider !== 'elastic.co') {
  //   // elastic.co just uses 'documents' and doesn't accept other indexes/mappings
  //   await createIndex(options);
  //   const response = await getMapping(options);
  //   const existingIndexes = response[options.index].mappings.properties;
  //
  //   await setMapping({
  //     ...options,
  //     mapping: Object.fromEntries(
  //       Object.entries(options.mapping).filter(([key, _]) => {
  //         return !Object.keys(existingIndexes || []).includes(key);
  //       })
  //     )
  //   });
  // }

  const nodes = options.selector(data).map((node) => options.toDocument(node));
  const documents = await listDocuments(options);

  await Promise.all(nodes.map((node) => checkNode(node, documents, options)));
  await Promise.all(documents.map((document) => checkDocument(document, nodes, options)));
};

/**
 * Upserts via Bulk helper.
 *
 * This fails when upserting to AWS.
 *
 * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-helpers.html#bulk-helper
 *
 * @param {Client} client  Elastic search JS client
 * @param {Options} options
 * @param {object} data Set of data to upload (via gatsby graphql response)
 */
const upsertWithBulkHelper = async (client, options, data) => {
  const dataset = options
    .selector(data)
    .map((node) => options.toDocument(node))
    .filter((doc) => {
      if (!doc) {
        console.log('EMPTY', doc, _id);
      }
      return doc && doc.id;
    });
  // const body = dataset.flatMap((doc) => [{ index: { _index: options.index } }, doc]);

  console.log(3);
  console.log(dataset);
  const res = await client.helpers.bulk({
    flushBytes: 10000,
    refreshOnCompletion: false,
    datasource: dataset,
    onDocument: ({ id: _id, ...doc }) => {
      // return { create: { _index: options.index, _id } };
      return [
        { update: { _index: options.index, _id } }, //
        { doc_as_upsert: true, doc }
      ];
    },
    onDrop: (doc) => {
      console.log('onDrop', doc);
      return;
    }
  });
  console.log(4);
  console.log(res);
  console.log('ok');
};

/**
 * Upserts via bulk (no helper)
 *
 * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/bulk_examples.html
 *
 * @param {Client} client  Elastic search JS client
 * @param {Options} options
 * @param {object} data Set of data to upload (via gatsby graphql response)
 */
const upsertWithBulk = async (client, options, data) => {
  const dataset = options
    .selector(data)
    .map((node) => options.toDocument(node))
    .filter((doc) => {
      if (!doc) {
        console.log('EMPTY', doc, _id);
      }
      return doc && doc.id;
    });
  const body = dataset.flatMap(({ id: _id, ...doc }) => [{ index: { _index: options.index, _id } }, doc]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        });
      }
    });
    console.log(erroredDocuments);
  }
  const { body: count } = await client.count({ index: options.index });
  console.log(count);
};

/**
 * Hooks into Gatsby's build process. This function fetches and parses the data to synchronise with AWS Elasticsearch.
 */
exports.createPagesStatefully = async ({ graphql, reporter }, rawOptions) => {
  if (!rawOptions || !rawOptions.enabled) {
    return reporter.info('Skipping synchronisation with Elasticsearch');
  }

  const [error, validatedOptions] = validate(rawOptions, OptionsStruct);
  if (error || !validatedOptions) {
    return reporter.panic('gatsby-plugin-elasticsearch-search: Invalid or missing options:', error);
  }

  const options = validatedOptions;

  const { errors, data } = await graphql(options.query);
  if (errors) {
    return reporter.panic('gatsby-plugin-elasticsearch-search: Failed to run query:', errors);
  }

  try {
    const { Client } = require('@elastic/elasticsearch');

    let clientOptions = {};
    if (options.provider === 'aws') {
      const AWS = require('aws-sdk');
      const createAwsElasticsearchConnector = require('aws-elasticsearch-connector');
      clientOptions = createAwsElasticsearchConnector(new AWS.Config(options.auth));
    }

    const client = new Client({ node: options.endpoint, ...clientOptions });

    console.log(1);
    try {
      const { body: indices } = await client.cat.indices();
    } catch (error) {
      console.log(error);
    }
    console.log(2);
    const response = await client.indices.create(
      { index: options.index, body: { mappings: { properties: options.mapping } } },
      { ignore: [400] }
    );

    await upsertWithBulk(client, options, data);
    // await upsertWithBulkHelper(client, options, data);

    // const countResponse = await client.count({ index: options.index });
    // if (!countResponse || !countResponse.body) {
    //   console.error(countResponse);
    // } else {
    //   console.log(count);
    // }
  } catch (error) {
    return reporter.panic('gatsby-plugin-elasticsearch-search: Failed to synchronise with Elasticsearch:', error);
  }
};
