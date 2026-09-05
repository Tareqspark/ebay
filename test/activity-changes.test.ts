import { describe, it, expect } from "vitest";
import { diffFields, describeChanges } from "@/lib/admin/activity";

/**
 * The audit trail exists to answer "what did staff change, and what was it
 * before?". Everything below guards a way that question could silently get the
 * wrong answer — a spurious change, a missed one, or an unbounded value.
 */

describe("diffFields", () => {
  it("records both sides of a real change", () => {
    expect(diffFields({ title: "Old name" }, { title: "New name" })).toEqual({
      title: { from: "Old name", to: "New name" },
    });
  });

  it("ignores fields that were resubmitted unchanged", () => {
    // A form posts every field whether or not it was touched. Logging all of
    // them would bury the one edit that actually happened.
    const changes = diffFields(
      { title: "Same", description: "Same too", category: "A > B > C" },
      { title: "Same", description: "Same too", category: "A > B > D" }
    );
    expect(Object.keys(changes)).toEqual(["category"]);
  });

  it("does not treat a number and its string form as a change", () => {
    // Ids and numbers arrive from a form as strings; comparing them raw would
    // log an edit on every single save.
    expect(diffFields({ stock: 1 }, { stock: "1" })).toEqual({});
    expect(diffFields({ categoryId: 42 }, { categoryId: "42" })).toEqual({});
  });

  it("treats null, undefined and empty string as equivalent absence", () => {
    expect(diffFields({ description: null }, { description: "" })).toEqual({});
    expect(diffFields({ description: undefined }, { description: "" })).toEqual({});
  });

  it("records a value being filled in, and being cleared", () => {
    expect(diffFields({ description: null }, { description: "Now set" })).toEqual({
      description: { from: null, to: "Now set" },
    });
    expect(diffFields({ description: "Was set" }, { description: null })).toEqual({
      description: { from: "Was set", to: null },
    });
  });

  it("only considers keys present in the after object", () => {
    // The caller decides what an action is allowed to change; a field it never
    // submitted must not show up as having been removed.
    expect(diffFields({ title: "T", secret: "s" }, { title: "T2" })).toEqual({
      title: { from: "T", to: "T2" },
    });
  });

  it("truncates a long value and says how long it really was", () => {
    // Descriptions run to thousands of characters, and both sides are stored.
    // Without a cap the log would hold two full copies of every one.
    const long = "x".repeat(500);
    const { description } = diffFields({ description: long }, { description: "short" });
    expect(description.from).toHaveLength(200 + "… (500 chars)".length);
    expect(description.from).toContain("(500 chars)");
    expect(description.to).toBe("short");
  });

  it("leaves a value at the cap untruncated", () => {
    const exact = "y".repeat(200);
    const { description } = diffFields({ description: exact }, { description: "other" });
    expect(description.from).toBe(exact);
  });
});

describe("describeChanges", () => {
  it("names the fields that moved", () => {
    expect(
      describeChanges({
        title: { from: "a", to: "b" },
        category: { from: "c", to: "d" },
      })
    ).toBe("title, category");
  });

  it("is empty when nothing changed", () => {
    expect(describeChanges({})).toBe("");
  });
});
