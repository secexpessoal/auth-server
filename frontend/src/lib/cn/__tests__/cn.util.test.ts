import { describe, it, expect } from "vitest";
import { cn } from "@lib/cn/cn.util";

describe("cn utility", () => {
  it("should merge tailwind classes correctly", () => {
    expect(cn("bg-red-500", "p-4")).toBe("bg-red-500 p-4");
  });

  it("should handle conditional classes", () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn("p-4", isTrue && "bg-blue-500", isFalse && "hidden")).toBe("p-4 bg-blue-500");
  });

  it("should override conflicting classes", () => {
    expect(cn("p-4 p-8")).toBe("p-8");
  });
});
