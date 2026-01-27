import { execa } from "execa";
import { readFileSync } from "node:fs";
import type {
  CodeQualityRule,
  FileViolation,
  CodebaseMetrics,
} from "../types/metrics.js";

/**
 * Thresholds for code quality rules
 */
const THRESHOLDS = {
  "file-length": 300,
  "function-length": 30,
  "max-params": 3,
  "cyclomatic-complexity": 10,
} as const;

/**
 * Information about an extracted function
 */
interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  paramCount: number;
  body: string;
}

/**
 * Get all source files in a git repository
 */
export async function findSourceFiles(targetDir: string): Promise<string[]> {
  try {
    const { stdout } = await execa(
      "git",
      ["ls-files", "*.ts", "*.tsx", "*.js", "*.jsx"],
      { cwd: targetDir }
    );
    return stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .filter(
        (f) =>
          !f.includes("node_modules") &&
          !f.includes("dist/") &&
          !f.includes("build/") &&
          !f.includes(".min.") &&
          !f.endsWith(".d.ts")
      );
  } catch {
    return [];
  }
}

/**
 * Extract functions from source code using regex patterns
 * Handles: function declarations, arrow functions, and class methods
 */
export function extractFunctions(
  source: string,
  _filePath: string
): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  const lines = source.split("\n");

  // Patterns for function starts
  const functionPatterns = [
    // function name(params) or async function name(params)
    /^(\s*)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
    // const name = (params) => or const name = async (params) =>
    /^(\s*)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/,
    // const name = function(params)
    /^(\s*)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)/,
    // class method: name(params) { or async name(params) {
    /^(\s*)(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of functionPatterns) {
      const match = line.match(pattern);
      if (match) {
        const [, indent, name, params] = match;
        // Skip constructors and certain patterns
        if (
          name === "constructor" ||
          name === "if" ||
          name === "for" ||
          name === "while" ||
          name === "switch" ||
          name === "catch"
        ) {
          continue;
        }

        const paramCount = countParameters(params);
        const endLine = findFunctionEnd(lines, i, indent.length);

        if (endLine > i) {
          const body = lines.slice(i, endLine + 1).join("\n");
          functions.push({
            name,
            startLine: i + 1, // 1-indexed
            endLine: endLine + 1,
            paramCount,
            body,
          });
        }
        break;
      }
    }
  }

  return functions;
}

/**
 * Count parameters in a parameter list string
 */
function countParameters(params: string): number {
  const trimmed = params.trim();
  if (!trimmed) return 0;

  // Handle destructured params and type annotations
  let depth = 0;
  let count = 1;

  for (const char of trimmed) {
    if (char === "(" || char === "{" || char === "[" || char === "<") {
      depth++;
    } else if (char === ")" || char === "}" || char === "]" || char === ">") {
      depth--;
    } else if (char === "," && depth === 0) {
      count++;
    }
  }

  return count;
}

/**
 * Find the closing brace of a function by tracking brace depth
 */
function findFunctionEnd(
  lines: string[],
  startLine: number,
  _baseIndent: number
): number {
  let braceDepth = 0;
  let foundOpenBrace = false;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];

    for (const char of line) {
      if (char === "{") {
        braceDepth++;
        foundOpenBrace = true;
      } else if (char === "}") {
        braceDepth--;
        if (foundOpenBrace && braceDepth === 0) {
          return i;
        }
      }
    }
  }

  // Fallback: look for line with matching indent and closing brace
  return startLine;
}

/**
 * Calculate cyclomatic complexity of a code block
 * Counts: if, else if, case, &&, ||, ?:, catch, for, while, do
 */
export function countComplexity(code: string): number {
  let complexity = 1; // Base complexity

  // Decision points that increase complexity
  const patterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bcase\s+/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bdo\s*\{/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?\?/g, // nullish coalescing
  ];

  // Ternary operator (but not in type annotations)
  const ternaryPattern = /\?[^:?]+:/g;

  for (const pattern of patterns) {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  // Count ternary operators (excluding type declarations)
  const ternaryMatches = code.match(ternaryPattern);
  if (ternaryMatches) {
    complexity += ternaryMatches.length;
  }

  return complexity;
}

/**
 * Find magic numbers in source code
 * Magic numbers are numeric literals not in const declarations or common patterns
 */
export function findMagicNumbers(
  source: string,
  filePath: string
): FileViolation[] {
  const violations: FileViolation[] = [];
  const lines = source.split("\n");

  // Allowed numbers (common and acceptable)
  const allowedNumbers = new Set([
    "0",
    "1",
    "-1",
    "2",
    "100",
    "1000",
    "0.5",
    "0.1",
  ]);

  // Pattern to match numbers (including decimals and negative)
  const numberPattern = /-?\d+\.?\d*/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip const/let declarations (these define named constants)
    if (/^\s*(?:export\s+)?const\s+\w+\s*[:=]/.test(line)) {
      continue;
    }

    // Skip import statements
    if (trimmedLine.startsWith("import ")) {
      continue;
    }

    // Skip comments
    if (trimmedLine.startsWith("//") || trimmedLine.startsWith("*")) {
      continue;
    }

    // Skip array index access [0], [1], etc. and common patterns
    const cleanedLine = line
      .replace(/\[\d+\]/g, "") // array indices
      .replace(/\.length\s*[<>=]+\s*\d+/g, "") // length comparisons
      .replace(/:\s*number/g, "") // type annotations
      .replace(/[<>=]+\s*0\b/g, "") // comparisons with 0
      .replace(/\+\+|--/g, ""); // increment/decrement

    const matches = cleanedLine.match(numberPattern);
    if (matches) {
      for (const match of matches) {
        // Skip if it's an allowed number
        if (allowedNumbers.has(match)) continue;

        // Skip hex/octal/binary literals (like 0x1F, 0b1010)
        if (/0[xXbBoO]/.test(match)) continue;

        // Skip version-like numbers (in strings)
        if (line.includes(`"${match}`) || line.includes(`'${match}`)) continue;

        violations.push({
          filePath,
          rule: "magic-number",
          line: i + 1,
          message: `Magic number ${match} should be a named constant`,
        });
      }
    }
  }

  return violations;
}

/**
 * Analyze a single file for all code quality rules
 */
export function analyzeFile(
  filePath: string,
  source: string
): FileViolation[] {
  const violations: FileViolation[] = [];
  const lines = source.split("\n");
  const lineCount = lines.length;

  // Rule: file-length
  if (lineCount > THRESHOLDS["file-length"]) {
    violations.push({
      filePath,
      rule: "file-length",
      line: 1,
      message: `File has ${lineCount} lines (max: ${THRESHOLDS["file-length"]})`,
    });
  }

  // Extract functions for detailed analysis
  const functions = extractFunctions(source, filePath);

  for (const fn of functions) {
    const fnLineCount = fn.endLine - fn.startLine + 1;

    // Rule: function-length
    if (fnLineCount > THRESHOLDS["function-length"]) {
      violations.push({
        filePath,
        rule: "function-length",
        line: fn.startLine,
        message: `Function '${fn.name}' has ${fnLineCount} lines (max: ${THRESHOLDS["function-length"]})`,
      });
    }

    // Rule: max-params
    if (fn.paramCount > THRESHOLDS["max-params"]) {
      violations.push({
        filePath,
        rule: "max-params",
        line: fn.startLine,
        message: `Function '${fn.name}' has ${fn.paramCount} parameters (max: ${THRESHOLDS["max-params"]})`,
      });
    }

    // Rule: cyclomatic-complexity
    const complexity = countComplexity(fn.body);
    if (complexity > THRESHOLDS["cyclomatic-complexity"]) {
      violations.push({
        filePath,
        rule: "cyclomatic-complexity",
        line: fn.startLine,
        message: `Function '${fn.name}' has complexity ${complexity} (max: ${THRESHOLDS["cyclomatic-complexity"]})`,
      });
    }
  }

  // Rule: magic-number
  const magicViolations = findMagicNumbers(source, filePath);
  violations.push(...magicViolations);

  return violations;
}

/**
 * Analyze the entire codebase for compliance
 */
export async function analyzeCodebase(
  targetDir: string
): Promise<CodebaseMetrics> {
  const files = await findSourceFiles(targetDir);
  const allViolations: FileViolation[] = [];
  let totalLines = 0;

  // Track violations by rule and by file
  const violationsByRule: Record<CodeQualityRule, number> = {
    "file-length": 0,
    "function-length": 0,
    "max-params": 0,
    "cyclomatic-complexity": 0,
    "magic-number": 0,
  };

  const violationsByFile: Map<string, number> = new Map();

  for (const file of files) {
    try {
      const fullPath = `${targetDir}/${file}`;
      const source = readFileSync(fullPath, "utf-8");
      totalLines += source.split("\n").length;

      const violations = analyzeFile(file, source);

      for (const v of violations) {
        violationsByRule[v.rule]++;
        violationsByFile.set(file, (violationsByFile.get(file) || 0) + 1);
      }

      allViolations.push(...violations);
    } catch {
      // Skip files that can't be read
    }
  }

  // Calculate compliance percentages
  // For file-based rules (file-length), compliance is % of files without violations
  // For function-based rules, we estimate based on total functions analyzed
  const filesWithoutFileLengthViolation =
    files.length - violationsByRule["file-length"];
  const fileLengthCompliance =
    files.length > 0
      ? Math.round((filesWithoutFileLengthViolation / files.length) * 100)
      : 100;

  // For other rules, use a simpler heuristic: fewer violations = higher compliance
  // Base it on a reasonable expectation (1 violation per 10 files is acceptable)
  const calculateRuleCompliance = (
    violations: number,
    fileCount: number
  ): number => {
    if (fileCount === 0) return 100;
    const expectedMax = Math.max(1, Math.floor(fileCount / 5)); // Allow ~1 per 5 files
    const ratio = Math.min(1, violations / expectedMax);
    return Math.round((1 - ratio * 0.5) * 100); // Scale from 50-100%
  };

  const complianceByRule: Record<CodeQualityRule, number> = {
    "file-length": fileLengthCompliance,
    "function-length": calculateRuleCompliance(
      violationsByRule["function-length"],
      files.length
    ),
    "max-params": calculateRuleCompliance(
      violationsByRule["max-params"],
      files.length
    ),
    "cyclomatic-complexity": calculateRuleCompliance(
      violationsByRule["cyclomatic-complexity"],
      files.length
    ),
    "magic-number": calculateRuleCompliance(
      violationsByRule["magic-number"],
      files.length
    ),
  };

  // Overall compliance is average of all rules
  const overallCompliance = Math.round(
    Object.values(complianceByRule).reduce((a, b) => a + b, 0) / 5
  );

  // Get worst files
  const worstFiles = Array.from(violationsByFile.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    filesAnalyzed: files.length,
    totalLines,
    violations: allViolations,
    complianceByRule,
    overallCompliance,
    worstFiles,
  };
}
