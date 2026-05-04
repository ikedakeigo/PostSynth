import { describe, it, expect } from "vitest";

function add(a: number, b: number): number {
  return a + b;
}

describe("sample", () => {
  it("adds two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("handles negative numbers", () => {
    expect(add(-1, 1)).toBe(0);
  });
});
