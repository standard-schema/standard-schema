/**
 * This is an example showing how to accept Standard Codecs in a generic way.
 */

import type { StandardCodecV1 } from "@standard-schema/spec";

// Decodes an encoded value, e.g. data read off the wire.
export async function standardDecode<T extends StandardCodecV1>(
  codec: T,
  value: unknown,
): Promise<StandardCodecV1.InferOutput<T>> {
  let result = codec["~standard"].validate(value);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, decoding failed
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}

// Encodes a decoded value, e.g. data about to be written to the wire.
export async function standardEncode<T extends StandardCodecV1>(
  codec: T,
  value: StandardCodecV1.InferOutput<T>,
): Promise<StandardCodecV1.InferInput<T>> {
  let result = codec["~standard"].encode(value);
  if (result instanceof Promise) result = await result;

  // if the `issues` field exists, encoding failed
  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}
