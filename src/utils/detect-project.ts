import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DetectionResult, ProjectType } from "../types/config.js";

interface IndicatorCheck {
  file: string;
  type: ProjectType;
  confidence: "high" | "medium";
}

const INDICATORS: IndicatorCheck[] = [
  { file: "nx.json", type: "nx", confidence: "high" },
  { file: "turbo.json", type: "turbo", confidence: "high" },
  { file: "pnpm-workspace.yaml", type: "pnpm-workspace", confidence: "high" },
  { file: "lerna.json", type: "pnpm-workspace", confidence: "medium" },
];

/**
 * Detect the project type based on configuration files
 */
export async function detectProjectType(
  targetDir: string = process.cwd()
): Promise<DetectionResult> {
  const foundIndicators: string[] = [];
  let detectedType: ProjectType = "single";
  let confidence: "high" | "medium" | "low" = "low";

  for (const indicator of INDICATORS) {
    const filePath = join(targetDir, indicator.file);
    if (existsSync(filePath)) {
      foundIndicators.push(indicator.file);

      // First match with highest confidence wins
      if (
        confidence === "low" ||
        (confidence === "medium" && indicator.confidence === "high")
      ) {
        detectedType = indicator.type;
        confidence = indicator.confidence;
      }
    }
  }

  // If we found indicators but couldn't determine type, it's still better than nothing
  if (foundIndicators.length > 0 && confidence === "low") {
    confidence = "medium";
  }

  return {
    type: detectedType,
    confidence,
    indicators: foundIndicators,
  };
}

/**
 * Check if project uses TypeScript
 */
export async function hasTypeScript(
  targetDir: string = process.cwd()
): Promise<boolean> {
  const tsConfigPath = join(targetDir, "tsconfig.json");
  return existsSync(tsConfigPath);
}

/**
 * Check if project uses ESLint
 */
export async function hasEslint(
  targetDir: string = process.cwd()
): Promise<boolean> {
  const eslintFiles = [
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
  ];

  for (const file of eslintFiles) {
    if (existsSync(join(targetDir, file))) {
      return true;
    }
  }

  // Also check package.json for eslintConfig
  try {
    const pkgPath = join(targetDir, "package.json");
    if (existsSync(pkgPath)) {
      const content = await readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.eslintConfig) {
        return true;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return false;
}

/**
 * Check if project uses Prettier
 */
export async function hasPrettier(
  targetDir: string = process.cwd()
): Promise<boolean> {
  const prettierFiles = [
    ".prettierrc",
    ".prettierrc.js",
    ".prettierrc.cjs",
    ".prettierrc.json",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.toml",
    "prettier.config.js",
    "prettier.config.cjs",
    "prettier.config.mjs",
  ];

  for (const file of prettierFiles) {
    if (existsSync(join(targetDir, file))) {
      return true;
    }
  }

  // Also check package.json for prettier config
  try {
    const pkgPath = join(targetDir, "package.json");
    if (existsSync(pkgPath)) {
      const content = await readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.prettier) {
        return true;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return false;
}

/**
 * Check if project uses React
 */
export async function hasReact(
  targetDir: string = process.cwd()
): Promise<boolean> {
  try {
    const pkgPath = join(targetDir, "package.json");
    if (existsSync(pkgPath)) {
      const content = await readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return "react" in deps || "react-dom" in deps;
    }
  } catch {
    // Ignore parse errors
  }
  return false;
}

/**
 * Get a human-readable description of the project type
 */
export function getProjectTypeDescription(type: ProjectType): string {
  switch (type) {
    case "nx":
      return "NX Monorepo";
    case "turbo":
      return "Turborepo";
    case "pnpm-workspace":
      return "pnpm Workspace";
    case "single":
      return "Single Package";
  }
}
