import { describe, it, expect } from "vitest";
import {
  isConventionalCommit,
  calculateAuthorMetrics,
} from "../metrics.js";
import {
  extractFunctions,
  countComplexity,
  findMagicNumbers,
  analyzeFile,
} from "../../utils/code-analyzer.js";
import type { CommitInfo } from "../../types/metrics.js";

describe("isConventionalCommit", () => {
  it("should accept valid conventional commits with emoji", () => {
    expect(isConventionalCommit("✨ feat(auth): add login flow")).toBe(true);
    expect(isConventionalCommit("🐛 fix(api): resolve timeout")).toBe(true);
    expect(isConventionalCommit("📝 docs: update readme")).toBe(true);
    expect(isConventionalCommit("💄 style(ui): format button")).toBe(true);
    expect(isConventionalCommit("♻️ refactor(core): simplify logic")).toBe(true);
    expect(isConventionalCommit("⚡ perf: optimize queries")).toBe(true);
    expect(isConventionalCommit("✅ test(auth): add login tests")).toBe(true);
    expect(isConventionalCommit("📦 build: update deps")).toBe(true);
    expect(isConventionalCommit("👷 ci: add workflow")).toBe(true);
    expect(isConventionalCommit("🔧 chore: update config")).toBe(true);
    expect(isConventionalCommit("⏪ revert: undo change")).toBe(true);
  });

  it("should reject commits without emoji", () => {
    expect(isConventionalCommit("feat(auth): add login flow")).toBe(false);
    expect(isConventionalCommit("fix: resolve timeout")).toBe(false);
  });

  it("should reject commits without type", () => {
    expect(isConventionalCommit("✨ add login flow")).toBe(false);
    expect(isConventionalCommit("✨ (auth): add login flow")).toBe(false);
  });

  it("should reject commits without colon", () => {
    expect(isConventionalCommit("✨ feat add login")).toBe(false);
    expect(isConventionalCommit("✨ feat(auth) add login")).toBe(false);
  });

  it("should reject commits with wrong emoji", () => {
    expect(isConventionalCommit("🎉 feat: initial commit")).toBe(false);
    expect(isConventionalCommit("🚀 feat: deploy")).toBe(false);
  });

  it("should accept commits with scope containing numbers and hyphens", () => {
    expect(isConventionalCommit("✨ feat(auth-v2): add oauth")).toBe(true);
    expect(isConventionalCommit("🐛 fix(api-123): resolve issue")).toBe(true);
  });
});

describe("calculateAuthorMetrics", () => {
  it("should group commits by author email", () => {
    const commits: CommitInfo[] = [
      {
        hash: "abc123",
        authorName: "Alice",
        authorEmail: "alice@example.com",
        subject: "✨ feat: add feature",
        body: "Task: 123",
      },
      {
        hash: "def456",
        authorName: "Alice Smith",
        authorEmail: "alice@example.com",
        subject: "🐛 fix: fix bug",
        body: "",
      },
      {
        hash: "ghi789",
        authorName: "Bob",
        authorEmail: "bob@example.com",
        subject: "regular commit",
        body: "",
      },
    ];

    const metrics = calculateAuthorMetrics(commits);

    expect(metrics).toHaveLength(2);

    const alice = metrics.find((m) => m.email === "alice@example.com");
    expect(alice).toBeDefined();
    expect(alice?.name).toBe("Alice Smith"); // Most recent name
    expect(alice?.totalCommits).toBe(2);
    expect(alice?.conventionalCompliance).toBe(100);
    expect(alice?.taskLinkCompliance).toBe(50); // 1 of 2 has task link
  });

  it("should calculate weighted overall score", () => {
    const commits: CommitInfo[] = [
      {
        hash: "abc123",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "✨ feat: add feature",
        body: "Task: 123",
      },
    ];

    const metrics = calculateAuthorMetrics(commits);
    const dev = metrics[0];

    // 100% task link * 0.4 + 100% conventional * 0.6 = 100
    expect(dev.overallScore).toBe(100);
  });

  it("should sort by overall score descending", () => {
    const commits: CommitInfo[] = [
      {
        hash: "a1",
        authorName: "Low",
        authorEmail: "low@example.com",
        subject: "bad commit",
        body: "",
      },
      {
        hash: "a2",
        authorName: "High",
        authorEmail: "high@example.com",
        subject: "✨ feat: good",
        body: "Task: 1",
      },
    ];

    const metrics = calculateAuthorMetrics(commits);

    expect(metrics[0].email).toBe("high@example.com");
    expect(metrics[1].email).toBe("low@example.com");
  });

  it("should handle empty commits array", () => {
    const metrics = calculateAuthorMetrics([]);
    expect(metrics).toHaveLength(0);
  });

  it("should recognize various task link formats", () => {
    const commits: CommitInfo[] = [
      {
        hash: "a1",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "commit",
        body: "https://app.asana.com/0/123/456",
      },
      {
        hash: "a2",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "commit Closes #42",
        body: "",
      },
      {
        hash: "a3",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "commit",
        body: "Fixes #123",
      },
      {
        hash: "a4",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "commit",
        body: "Resolves #789",
      },
      {
        hash: "a5",
        authorName: "Dev",
        authorEmail: "dev@example.com",
        subject: "commit",
        body: "https://github.com/org/repo/issues/42",
      },
    ];

    const metrics = calculateAuthorMetrics(commits);
    expect(metrics[0].taskLinkCompliance).toBe(100);
  });
});

describe("extractFunctions", () => {
  it("should extract function declarations", () => {
    const source = `
function hello(name: string) {
  return "Hello " + name;
}
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe("hello");
    expect(functions[0].paramCount).toBe(1);
  });

  it("should extract arrow functions", () => {
    const source = `
const add = (a: number, b: number) => {
  return a + b;
};
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe("add");
    expect(functions[0].paramCount).toBe(2);
  });

  it("should extract async functions", () => {
    const source = `
async function fetchData(url: string) {
  return fetch(url);
}

const getData = async (id: number) => {
  return await fetch(id);
};
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(2);
  });

  it("should count function length correctly", () => {
    const source = `
function longFunction() {
  const a = 1;
  const b = 2;
  const c = 3;
  return a + b + c;
}
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(1);
    const lineCount = functions[0].endLine - functions[0].startLine + 1;
    expect(lineCount).toBe(6);
  });

  it("should skip control flow keywords", () => {
    const source = `
function test() {
  if (true) {
    return 1;
  }
  for (let i = 0; i < 10; i++) {
    console.log(i);
  }
}
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe("test");
  });

  it("should handle simple parameters", () => {
    const source = `
function process(user: User, options: Options) {
  return user;
}
`;
    const functions = extractFunctions(source, "test.ts");

    expect(functions).toHaveLength(1);
    expect(functions[0].paramCount).toBe(2);
  });
});

describe("countComplexity", () => {
  it("should return 1 for empty function", () => {
    const code = `function empty() {}`;
    expect(countComplexity(code)).toBe(1);
  });

  it("should count if statements", () => {
    const code = `
if (a) { }
if (b) { }
`;
    expect(countComplexity(code)).toBe(3); // base 1 + 2 ifs
  });

  it("should count else if", () => {
    const code = `
if (a) { }
else if (b) { }
else if (c) { }
`;
    // Note: both "if" and "else if" patterns match, so total is base 1 + 3 ifs + 2 else ifs = 6
    expect(countComplexity(code)).toBe(6);
  });

  it("should count logical operators", () => {
    const code = `if (a && b || c) { }`;
    expect(countComplexity(code)).toBe(4); // base 1 + if + && + ||
  });

  it("should count loops", () => {
    const code = `
for (let i = 0; i < 10; i++) { }
while (true) { }
`;
    expect(countComplexity(code)).toBe(3); // base 1 + for + while
  });

  it("should count do-while loops", () => {
    const code = `do { x++; } while (cond);`;
    // do-while: "do {" matches + "while (" also matches = base 1 + 2
    expect(countComplexity(code)).toBe(3);
  });

  it("should count case statements", () => {
    const code = `
switch (x) {
  case 1: break;
  case 2: break;
  case 3: break;
}
`;
    expect(countComplexity(code)).toBe(4); // base 1 + 3 cases
  });

  it("should count catch blocks", () => {
    const code = `
try { }
catch (e) { }
`;
    expect(countComplexity(code)).toBe(2); // base 1 + catch
  });

  it("should count nullish coalescing", () => {
    const code = `const x = a ?? b ?? c;`;
    expect(countComplexity(code)).toBe(3); // base 1 + 2 ??
  });
});

describe("findMagicNumbers", () => {
  it("should detect magic numbers", () => {
    const source = `
function calculate() {
  return value * 42;
}
`;
    const violations = findMagicNumbers(source, "test.ts");

    expect(violations.some((v) => v.message.includes("42"))).toBe(true);
  });

  it("should allow common numbers", () => {
    const source = `
const x = array[0];
const y = items.length > 0 ? 1 : -1;
`;
    const violations = findMagicNumbers(source, "test.ts");

    expect(violations).toHaveLength(0);
  });

  it("should allow const declarations", () => {
    const source = `
const MAX_RETRIES = 5;
const TIMEOUT_MS = 3000;
`;
    const violations = findMagicNumbers(source, "test.ts");

    expect(violations).toHaveLength(0);
  });

  it("should skip import statements", () => {
    const source = `
import { something } from "package@1.2.3";
`;
    const violations = findMagicNumbers(source, "test.ts");

    expect(violations).toHaveLength(0);
  });

  it("should skip single-line comments", () => {
    const source = `
// Use 42 as the answer
function test() { }
`;
    const violations = findMagicNumbers(source, "test.ts");

    expect(violations).toHaveLength(0);
  });
});

describe("analyzeFile", () => {
  it("should detect file length violations", () => {
    const longSource = Array(350).fill("const x = 1;").join("\n");
    const violations = analyzeFile("test.ts", longSource);

    expect(
      violations.some(
        (v) => v.rule === "file-length" && v.message.includes("350")
      )
    ).toBe(true);
  });

  it("should not flag files under 300 lines", () => {
    const shortSource = Array(100).fill("const x = 1;").join("\n");
    const violations = analyzeFile("test.ts", shortSource);

    expect(violations.filter((v) => v.rule === "file-length")).toHaveLength(0);
  });

  it("should detect function length violations", () => {
    const lines = ["function longFunc() {"];
    for (let i = 0; i < 35; i++) {
      lines.push(`  const x${i} = ${i};`);
    }
    lines.push("}");

    const violations = analyzeFile("test.ts", lines.join("\n"));

    expect(violations.some((v) => v.rule === "function-length")).toBe(true);
  });

  it("should detect max params violations", () => {
    const source = `
function tooMany(a: number, b: number, c: number, d: number, e: number) {
  return a + b + c + d + e;
}
`;
    const violations = analyzeFile("test.ts", source);

    expect(
      violations.some(
        (v) => v.rule === "max-params" && v.message.includes("5 parameters")
      )
    ).toBe(true);
  });

  it("should detect cyclomatic complexity violations", () => {
    const source = `
function complex(a: number, b: number) {
  if (a > 0) {
    if (b > 0) {
      if (a > b) {
        return a && b || a || b;
      }
    }
  }
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0 && i > 5) {
      while (i > 0) {
        i--;
      }
    }
  }
  return a ?? b ?? 0;
}
`;
    const violations = analyzeFile("test.ts", source);

    expect(
      violations.some((v) => v.rule === "cyclomatic-complexity")
    ).toBe(true);
  });

  it("should return multiple violation types", () => {
    const source = `
function badFunc(a: number, b: number, c: number, d: number, e: number) {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            if (a && b && c && d && e) {
              return 1;
            }
          }
        }
      }
    }
  }
  return 0;
}
`;
    const violations = analyzeFile("test.ts", source);

    // Should have max-params (5 params) and cyclomatic-complexity (high)
    const rules = new Set(violations.map((v) => v.rule));
    expect(rules.has("max-params")).toBe(true);
    expect(rules.has("cyclomatic-complexity")).toBe(true);
  });
});
