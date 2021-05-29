const { sendRequest } = require('./api');

const getIndex = async (options) => {
  // TODO: Response type
  const [error] = await sendRequest('GET', '', {}, options);
  return !error;
};

const createIndex = async (options) => {
  if (await getIndex(options)) {
    return;
  }

  const [error] = await sendRequest('PUT', '', {}, options);

  if (error) {
    throw new Error('Failed to create index');
  }
};

const setMapping = async (options) => {
  if (!options.mapping) {
    return;
  }

  const request = {
    properties: options.mapping
  };

  const [error] = await sendRequest('PUT', '_mapping', request, options);

  if (error) {
    throw new Error('Failed to set mapping for index');
  }
};

/**
 * List all documents.
 *
 * @template Document
 * @param {Options} options
 * @return {Promise<void>}
 */
const listDocuments = async (options) => {
  const [error, response] = await sendRequest(
    'POST',
    '_search',
    // TODO: Pagination
    {
      from: 0,
      size: 10000,
      query: {
        match_all: {}
      }
    },
    options
  );

  if (error || !response) {
    throw new Error('Failed to list all documents');
  }

  return response.hits.hits;
};

/**
 * Create a document by ID.
 *
 * @template Document
 * @param {string} _id
 * @param {Document} _document
 * @param {Options} options
 * @return {Promise<void>}
 */
const createDocument = async (_id, _document, options) => {
  const [error, response] = await sendRequest('POST', `_doc/${_id}`, _document, options);

  if (error || !response) {
    // eslint-disable-next-line no-console
    console.log(_id, _document, options, error, response);
    throw new Error('Failed to create document');
  }
};

/**
 * Update a document by ID. Note that this will overwrite the full document, it does not support partial updates.
 *
 * @template Document
 * @param {string} _id
 * @param {Document} _document
 * @param {Options} options
 * @return {Promise<void>}
 */
const updateDocument = async (_id, _document, options) => {
  const [error, response] = await sendRequest('PUT', `_doc/${_id}`, _document, options);

  if (error || !response) {
    throw new Error('Failed to update document');
  }
};

/**
 * Delete a document by ID.
 *
 * @param {string} _id
 * @param {Options} options
 * @return {Promise<void>}
 */
const deleteDocument = async (_id, options) => {
  const [error, response] = await sendRequest('DELETE', `_doc/${_id}`, {}, options);

  if (error || !response) {
    throw new Error('Failed to delete document');
  }
};

module.exports = { listDocuments, setMapping, createIndex, updateDocument, deleteDocument, createDocument };
