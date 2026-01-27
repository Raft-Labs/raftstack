import { join } from "node:path";
import type { GeneratorResult, ProjectType } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Generate shared ESLint configuration package for monorepos
 * Creates packages/eslint-config/ with base, next.js, react-internal, and vite configs
 */

// ESLint config package.json
function getEslintConfigPackageJson(): string {
  return JSON.stringify(
    {
      name: "@workspace/eslint-config",
      version: "0.0.0",
      type: "module",
      private: true,
      exports: {
        "./base": "./base.js",
        "./next-js": "./next.js",
        "./react-internal": "./react-internal.js",
        "./vite": "./vite.js",
      },
      devDependencies: {
        "@eslint/js": "^9.39.0",
        "@next/eslint-plugin-next": "^16.1.0",
        eslint: "^9.39.0",
        "eslint-config-prettier": "^10.1.0",
        "eslint-plugin-only-warn": "^1.1.0",
        "eslint-plugin-react": "^7.37.0",
        "eslint-plugin-react-hooks": "^5.2.0",
        "eslint-plugin-turbo": "^2.6.0",
        globals: "^17.0.0",
        "typescript-eslint": "^8.39.0",
      },
    },
    null,
    2
  ) + "\n";
}

// Base ESLint config (TypeScript + Turbo)
function getBaseEslintConfig(): string {
  return `import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration for all packages
 * Includes TypeScript, Prettier, and Turborepo rules
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: { turbo: turboPlugin },
    rules: { "turbo/no-undeclared-env-vars": "warn" },
  },
  { plugins: { onlyWarn } },
  { ignores: ["dist/**"] },
];
`;
}

// Next.js ESLint config
function getNextJsEslintConfig(): string {
  return `import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for Next.js applications
 * Extends base config with Next.js specific rules
 */
export const nextJsConfig = defineConfig([
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default nextJsConfig;
`;
}

// React internal library config
function getReactInternalEslintConfig(): string {
  return `import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for internal React libraries/packages
 * Extends base config with React-specific rules
 */
export const reactInternalConfig = [
  ...baseConfig,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];

export default reactInternalConfig;
`;
}

// Vite config
function getViteEslintConfig(): string {
  return `import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for Vite-based applications
 * Extends base config with React and browser globals
 */
export const viteConfig = [
  ...baseConfig,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];

export default viteConfig;
`;
}

/**
 * Generate shared TypeScript configuration package for monorepos
 * Creates packages/typescript-config/ with base and nextjs configs
 */

// TypeScript config package.json
function getTsConfigPackageJson(): string {
  return JSON.stringify(
    {
      name: "@workspace/typescript-config",
      version: "0.0.0",
      private: true,
    },
    null,
    2
  ) + "\n";
}

// Base TypeScript config
function getBaseTsConfig(): string {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/tsconfig",
      display: "Default",
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        esModuleInterop: true,
        incremental: false,
        isolatedModules: true,
        lib: ["es2022", "DOM", "DOM.Iterable"],
        module: "NodeNext",
        moduleDetection: "force",
        moduleResolution: "NodeNext",
        noUncheckedIndexedAccess: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        strict: true,
        target: "ES2022",
      },
    },
    null,
    2
  ) + "\n";
}

// Next.js TypeScript config
function getNextJsTsConfig(): string {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/tsconfig",
      display: "Next.js",
      extends: "./base.json",
      compilerOptions: {
        plugins: [{ name: "next" }],
        module: "ESNext",
        moduleResolution: "Bundler",
        allowJs: true,
        jsx: "preserve",
        noEmit: true,
      },
    },
    null,
    2
  ) + "\n";
}

// React library TypeScript config
function getReactLibraryTsConfig(): string {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/tsconfig",
      display: "React Library",
      extends: "./base.json",
      compilerOptions: {
        jsx: "react-jsx",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
      },
    },
    null,
    2
  ) + "\n";
}

// Node library TypeScript config
function getNodeLibraryTsConfig(): string {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/tsconfig",
      display: "Node Library",
      extends: "./base.json",
      compilerOptions: {
        lib: ["ES2022"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
      },
    },
    null,
    2
  ) + "\n";
}

/**
 * Check if this is a monorepo project type
 */
export function isMonorepo(projectType: ProjectType): boolean {
  return projectType === "turbo" || projectType === "nx" || projectType === "pnpm-workspace";
}

/**
 * Generate shared configuration packages for monorepos
 *
 * Creates:
 * - packages/eslint-config/ with base, next-js, react-internal, vite configs
 * - packages/typescript-config/ with base, nextjs, react-library, node-library configs
 */
export async function generateSharedConfigs(
  targetDir: string,
  projectType: ProjectType
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  // Only generate for monorepos
  if (!isMonorepo(projectType)) {
    return result;
  }

  const packagesDir = join(targetDir, "packages");

  // Generate ESLint config package
  const eslintConfigDir = join(packagesDir, "eslint-config");
  await ensureDir(eslintConfigDir);

  const eslintFiles: Array<{ path: string; content: string; name: string }> = [
    { path: join(eslintConfigDir, "package.json"), content: getEslintConfigPackageJson(), name: "packages/eslint-config/package.json" },
    { path: join(eslintConfigDir, "base.js"), content: getBaseEslintConfig(), name: "packages/eslint-config/base.js" },
    { path: join(eslintConfigDir, "next.js"), content: getNextJsEslintConfig(), name: "packages/eslint-config/next.js" },
    { path: join(eslintConfigDir, "react-internal.js"), content: getReactInternalEslintConfig(), name: "packages/eslint-config/react-internal.js" },
    { path: join(eslintConfigDir, "vite.js"), content: getViteEslintConfig(), name: "packages/eslint-config/vite.js" },
  ];

  for (const file of eslintFiles) {
    const writeResult = await writeFileSafe(file.path, file.content, { backup: true });
    if (writeResult.created) {
      result.created.push(file.name);
      if (writeResult.backedUp) {
        result.backedUp.push(file.name);
      }
    }
  }

  // Generate TypeScript config package
  const tsConfigDir = join(packagesDir, "typescript-config");
  await ensureDir(tsConfigDir);

  const tsFiles: Array<{ path: string; content: string; name: string }> = [
    { path: join(tsConfigDir, "package.json"), content: getTsConfigPackageJson(), name: "packages/typescript-config/package.json" },
    { path: join(tsConfigDir, "base.json"), content: getBaseTsConfig(), name: "packages/typescript-config/base.json" },
    { path: join(tsConfigDir, "nextjs.json"), content: getNextJsTsConfig(), name: "packages/typescript-config/nextjs.json" },
    { path: join(tsConfigDir, "react-library.json"), content: getReactLibraryTsConfig(), name: "packages/typescript-config/react-library.json" },
    { path: join(tsConfigDir, "node-library.json"), content: getNodeLibraryTsConfig(), name: "packages/typescript-config/node-library.json" },
  ];

  for (const file of tsFiles) {
    const writeResult = await writeFileSafe(file.path, file.content, { backup: true });
    if (writeResult.created) {
      result.created.push(file.name);
      if (writeResult.backedUp) {
        result.backedUp.push(file.name);
      }
    }
  }

  return result;
}
