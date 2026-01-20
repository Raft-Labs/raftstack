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
 * Generate ESLint flat config content for TypeScript projects
 */
function generateTsConfig(hasReactDep: boolean): string {
  if (hasReactDep) {
    return `import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
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
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "no-console": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["node_modules", "dist", "build", ".next", "coverage"],
  }
);
`;
  }

  return `import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",

      // General rules
      "no-console": "warn",
    },
  },
  {
    ignores: ["node_modules", "dist", "build", "coverage"],
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
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  eslint.configs.recommended,
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
      "no-console": "warn",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["node_modules", "dist", "build", ".next", "coverage"],
  },
];
`;
  }

  return `import eslint from "@eslint/js";
import globals from "globals";

export default [
  eslint.configs.recommended,
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
      "no-console": "warn",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["node_modules", "dist", "build", "coverage"],
  },
];
`;
}

/**
 * Get the ESLint dependencies to add to package.json
 */
export function getEslintDependencies(
  usesTypeScript: boolean,
  usesReact: boolean
): Record<string, string> {
  const deps: Record<string, string> = {
    eslint: "^9.0.0",
    "@eslint/js": "^9.0.0",
    globals: "^15.0.0",
  };

  if (usesTypeScript) {
    deps["typescript-eslint"] = "^8.0.0";
  }

  if (usesReact) {
    deps["eslint-plugin-react"] = "^7.35.0";
    deps["eslint-plugin-react-hooks"] = "^5.0.0";
  }

  return deps;
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
