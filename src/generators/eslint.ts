import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";
import { hasEslint } from "../utils/detect-project.js";

/**
 * Check if project uses React
 */
async function hasReact(targetDir: string): Promise<boolean> {
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
 * Generate ESLint flat config content for TypeScript projects (matching zero-to-one pattern)
 */
function generateTsConfig(hasReactDep: boolean): string {
  if (hasReactDep) {
    return `import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
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
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["node_modules/", "dist/", "build/", ".next/", "coverage/", ".turbo/"],
  }
);
`;
  }

  return `import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/", ".turbo/"],
  }
);
`;
}

/**
 * Generate ESLint flat config content for JavaScript projects
 */
function generateJsConfig(hasReactDep: boolean): string {
  if (hasReactDep) {
    return `import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
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
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["node_modules/", "dist/", "build/", ".next/", "coverage/", ".turbo/"],
  },
];
`;
  }

  return `import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/", ".turbo/"],
  },
];
`;
}

/**
 * Check if project uses React (exported for use by other modules)
 */
export async function detectReact(targetDir: string): Promise<boolean> {
  return hasReact(targetDir);
}

/**
 * Generate ESLint configuration file
 *
 * @param targetDir - The target directory to write to
 * @param usesTypeScript - Whether the project uses TypeScript
 * @param force - Force generation even if ESLint is already configured
 */
export async function generateEslint(
  targetDir: string,
  usesTypeScript: boolean,
  force: boolean = false
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  // Check if ESLint is already configured (unless force)
  if (!force && (await hasEslint(targetDir))) {
    result.skipped.push("eslint.config.js (ESLint already configured)");
    return result;
  }

  // Detect React
  const usesReact = await hasReact(targetDir);

  // Generate appropriate config
  const config = usesTypeScript
    ? generateTsConfig(usesReact)
    : generateJsConfig(usesReact);

  // Write config file
  const configPath = join(targetDir, "eslint.config.js");
  const writeResult = await writeFileSafe(configPath, config);

  if (writeResult.backedUp) {
    result.backedUp.push("eslint.config.js");
  }

  result.created.push("eslint.config.js");

  return result;
}
