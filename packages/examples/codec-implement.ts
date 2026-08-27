/**
 * This example shows how to implement the Standard Codec interface.
 * It demonstrates a bidirectional transformation between an ISO datetime
 * string and a `Date` instance.
 */

import type { StandardCodecV1 } from "@standard-schema/spec";

interface MyCodec extends StandardCodecV1<string, Date> {
  type: "codec";
}

export function isoDatetimeToDate(): MyCodec {
  return {
    type: "codec",
    "~standard": {
      version: 1,
      vendor: "example-lib",
      // the decode direction: string -> Date
      validate(value) {
        if (typeof value !== "string") {
          return { issues: [{ message: "Expected a string", path: [] }] };
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime())
          ? { issues: [{ message: "Invalid ISO datetime", path: [] }] }
          : { value: date };
      },
      // the encode direction: Date -> string
      encode(value) {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
          return { issues: [{ message: "Expected a valid Date", path: [] }] };
        }

        return { value: value.toISOString() };
      },
    },
  };
}

// usage example
const codec = isoDatetimeToDate();

codec["~standard"].validate("2025-01-01T00:00:00.000Z");
// => { value: Date("2025-01-01T00:00:00.000Z") }

codec["~standard"].encode(new Date("2025-01-01T00:00:00.000Z"));
// => { value: "2025-01-01T00:00:00.000Z" }
