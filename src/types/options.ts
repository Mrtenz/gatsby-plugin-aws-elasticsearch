import { AWSCredentials } from 'aws4';
import { DefaultDocument, DocumentID } from './document';

export interface MappingOptions {
  [key: string]: {
    type: string;
    index?: boolean;
  };
}

export type Options<
  Data = unknown,
  Node = Record<string, unknown>,
  Document extends DocumentID = DefaultDocument
> = AWSCredentials & {
  enabled: boolean;

  query: string;
  selector(data: Data): Node[];
  toDocument(node: Node): Document;

  mapping?: MappingOptions;

  endpoint: string;
  index: string;
};
