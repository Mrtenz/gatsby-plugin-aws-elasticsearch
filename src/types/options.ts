import { AWSCredentials } from 'aws4';
import { array, boolean, defaulted, func, number, object, optional, record, string, StructType } from 'superstruct';
import { DefaultDocument, DocumentID } from './document';

export const OptionsStruct = defaulted(
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

export type Options<
  Data = unknown,
  Node = Record<string, unknown>,
  Document extends DocumentID = DefaultDocument
> = AWSCredentials &
  StructType<typeof OptionsStruct> & {
    selector(data: Data): Node[];
    toDocument(node: Node): Document;
  };
