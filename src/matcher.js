const { createDocument, deleteDocument, updateDocument } = require('./elasticsearch');

const checkNode = async (node, documents, options) => {
  if (!node.id) {
    throw new Error('Node must have an `id` property');
  }

  const { id: _, ...rest } = node;
  const _document = documents.find((_doc) => _doc._id === node.id);

  if (_document) {
    return updateDocument(node.id, rest, options);
  }

  return createDocument(node.id, rest, options);
};

const checkDocument = async (document, nodes, options) => {
  const node = nodes.find((node) => node.id === document._id);
  if (!node) {
    return deleteDocument(document._id, options);
  }
};

module.exports = { checkNode, checkDocument };
