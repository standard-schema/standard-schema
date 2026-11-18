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
      decode(value) {
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

codec["~standard"].decode("2025-01-01T00:00:00.000Z");
// => { value: Date("2025-01-01T00:00:00.000Z") }

codec["~standard"].encode(new Date("2025-01-01T00:00:00.000Z"));
// => { value: "2025-01-01T00:00:00.000Z" }

/**
 * A class can also be its own codec, with no schema library involved.
 * The static `~standard` property makes `Point` itself a `StandardCodecV1`.
 */
export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  static readonly "~standard": StandardCodecV1.Props<[number, number], Point> =
    {
      version: 1,
      vendor: "example-lib",
      // the decode direction: [x, y] -> Point
      decode(value) {
        if (
          !Array.isArray(value) ||
          value.length !== 2 ||
          !value.every((n) => typeof n === "number")
        ) {
          return {
            issues: [
              { message: "Expected a [number, number] tuple", path: [] },
            ],
          };
        }

        return { value: new Point(value[0], value[1]) };
      },
      // the encode direction: Point -> [x, y]
      encode(value) {
        if (!(value instanceof Point)) {
          return { issues: [{ message: "Expected a Point", path: [] }] };
        }

        return { value: [value.x, value.y] };
      },
    };
}

// usage example
Point["~standard"].encode(new Point(1, 2));
// => { value: [1, 2] }

Point["~standard"].decode([1, 2]);
// => { value: Point { x: 1, y: 2 } }

// the class satisfies the interface, so it can be passed anywhere a codec is accepted
export const pointCodec: StandardCodecV1<[number, number], Point> = Point;
