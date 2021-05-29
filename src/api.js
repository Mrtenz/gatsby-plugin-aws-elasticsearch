import { sign } from 'aws4';
import fetch from 'node-fetch';

/**
 * Sign a request with the AWS credentials.
 *
 * @param {SignRequest} options
 * @param {AWSCredentials} credentials
 */
export const signRequest = (options, credentials) => {
  // aws4 modifies the original object so we create a copy here
  const { headers } = sign({ ...options, headers: { ...options.headers } }, credentials);
  return headers;
};

/**
 * Sign and send a request to the endpoint.
 *
 * @template Method
 * @template Document
 * @param {Method} method
 * @param {string} path
 * @param {RequestMethod<Document>[Method]} document
 * @param {Options} options
 */
export const sendRequest = async (method, path, document, options) => {
  const url = new URL(`${options.endpoint}/${options.index}/${path}`);

  const request = {
    method,
    path: url.pathname,
    service: 'es',
    headers: {
      'Content-Type': 'application/json',
      Host: url.hostname
    }
  };

  if (method !== 'GET') {
    request.body = JSON.stringify(document);
  }

  const headers = signRequest(request, {
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey
  });

  const response = await fetch(url.href, {
    method: method,
    body: request.body,
    headers
  });

  if (!response.ok) {
    // TODO: Provide more information about error
    return [true, undefined];
  }

  return [false, await response.json()];
};
