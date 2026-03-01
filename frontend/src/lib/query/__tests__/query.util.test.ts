import { describe, it, expect } from "vitest";
import { queryClient } from "../query.util";
import { QueryClient } from "@tanstack/react-query";

describe("query.util", () => {
  it("should export a QueryClient instance", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });
});
