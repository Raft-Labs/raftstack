import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  detectPackageManager,
  detectYarnVersion,
  getPackageManagerInfo,
  getPackageManagerDescription,
  PACKAGE_MANAGERS,
} from "../detect-package-manager.js";

describe("detect-package-manager", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "raftstack-pm-test-"));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("detectPackageManager", () => {
    it("should detect pnpm from pnpm-lock.yaml", () => {
      writeFileSync(join(testDir, "pnpm-lock.yaml"), "");

      const result = detectPackageManager(testDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe("pnpm");
      expect(result?.lockfile).toBe("pnpm-lock.yaml");
    });

    it("should detect yarn from yarn.lock (defaults to classic)", () => {
      writeFileSync(join(testDir, "yarn.lock"), "");

      const result = detectPackageManager(testDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe("yarn");
      expect(result?.lockfile).toBe("yarn.lock");
    });

    it("should detect yarn-berry from yarn.lock with packageManager field", () => {
      writeFileSync(join(testDir, "yarn.lock"), "");
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ packageManager: "yarn@3.6.0" })
      );

      const result = detectPackageManager(testDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe("yarn-berry");
      expect(result?.lockfile).toBe("yarn.lock");
    });

    it("should detect npm from package-lock.json", () => {
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const result = detectPackageManager(testDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe("npm");
      expect(result?.lockfile).toBe("package-lock.json");
    });

    it("should return null when no lockfile exists", () => {
      const result = detectPackageManager(testDir);

      expect(result).toBeNull();
    });

    it("should prioritize pnpm over yarn", () => {
      writeFileSync(join(testDir, "pnpm-lock.yaml"), "");
      writeFileSync(join(testDir, "yarn.lock"), "");

      const result = detectPackageManager(testDir);

      expect(result?.name).toBe("pnpm");
    });

    it("should prioritize pnpm over npm", () => {
      writeFileSync(join(testDir, "pnpm-lock.yaml"), "");
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const result = detectPackageManager(testDir);

      expect(result?.name).toBe("pnpm");
    });

    it("should prioritize yarn over npm", () => {
      writeFileSync(join(testDir, "yarn.lock"), "");
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const result = detectPackageManager(testDir);

      expect(result?.name).toBe("yarn");
    });
  });

  describe("detectYarnVersion", () => {
    it("should detect Yarn 1.x from packageManager field", () => {
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ packageManager: "yarn@1.22.19" })
      );

      const result = detectYarnVersion(testDir);

      expect(result).toBe("yarn");
    });

    it("should detect Yarn 2+ from packageManager field", () => {
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ packageManager: "yarn@3.6.0" })
      );

      const result = detectYarnVersion(testDir);

      expect(result).toBe("yarn-berry");
    });

    it("should detect Yarn 2.x as berry", () => {
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ packageManager: "yarn@2.4.3" })
      );

      const result = detectYarnVersion(testDir);

      expect(result).toBe("yarn-berry");
    });

    it("should return null when packageManager field is missing", () => {
      writeFileSync(join(testDir, "package.json"), JSON.stringify({}));

      const result = detectYarnVersion(testDir);

      expect(result).toBeNull();
    });

    it("should return null when package.json does not exist", () => {
      const result = detectYarnVersion(testDir);

      expect(result).toBeNull();
    });

    it("should return null for malformed packageManager field", () => {
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ packageManager: "invalid" })
      );

      const result = detectYarnVersion(testDir);

      expect(result).toBeNull();
    });

    it("should handle invalid JSON gracefully", () => {
      writeFileSync(join(testDir, "package.json"), "{ invalid json }");

      const result = detectYarnVersion(testDir);

      expect(result).toBeNull();
    });
  });

  describe("getPackageManagerInfo", () => {
    it("should return npm info", () => {
      const info = getPackageManagerInfo("npm");

      expect(info.name).toBe("npm");
      expect(info.install).toBe("npm install");
      expect(info.run).toBe("npm run");
      expect(info.exec).toBe("npx");
      expect(info.installFrozen).toBe("npm ci");
      expect(info.needsSetupAction).toBe(false);
    });

    it("should return pnpm info", () => {
      const info = getPackageManagerInfo("pnpm");

      expect(info.name).toBe("pnpm");
      expect(info.install).toBe("pnpm install");
      expect(info.run).toBe("pnpm");
      expect(info.exec).toBe("pnpm dlx");
      expect(info.installFrozen).toBe("pnpm install --frozen-lockfile");
      expect(info.needsSetupAction).toBe(true);
    });

    it("should return yarn info", () => {
      const info = getPackageManagerInfo("yarn");

      expect(info.name).toBe("yarn");
      expect(info.install).toBe("yarn install");
      expect(info.run).toBe("yarn");
      expect(info.exec).toBe("yarn");
      expect(info.installFrozen).toBe("yarn install --frozen-lockfile");
      expect(info.needsSetupAction).toBe(false);
    });

    it("should return yarn-berry info", () => {
      const info = getPackageManagerInfo("yarn-berry");

      expect(info.name).toBe("yarn-berry");
      expect(info.install).toBe("yarn install");
      expect(info.run).toBe("yarn");
      expect(info.exec).toBe("yarn dlx");
      expect(info.installFrozen).toBe("yarn install --immutable");
      expect(info.needsSetupAction).toBe(false);
    });
  });

  describe("getPackageManagerDescription", () => {
    it("should return npm description", () => {
      const info = PACKAGE_MANAGERS.npm;
      const description = getPackageManagerDescription(info);

      expect(description).toBe("npm (Node Package Manager)");
    });

    it("should return pnpm description", () => {
      const info = PACKAGE_MANAGERS.pnpm;
      const description = getPackageManagerDescription(info);

      expect(description).toBe("pnpm (Performant npm)");
    });

    it("should return yarn description", () => {
      const info = PACKAGE_MANAGERS.yarn;
      const description = getPackageManagerDescription(info);

      expect(description).toBe("Yarn Classic (1.x)");
    });

    it("should return yarn-berry description", () => {
      const info = PACKAGE_MANAGERS["yarn-berry"];
      const description = getPackageManagerDescription(info);

      expect(description).toBe("Yarn Berry (2+)");
    });
  });

  describe("PACKAGE_MANAGERS constant", () => {
    it("should have all required fields for npm", () => {
      const npm = PACKAGE_MANAGERS.npm;

      expect(npm).toHaveProperty("name");
      expect(npm).toHaveProperty("install");
      expect(npm).toHaveProperty("run");
      expect(npm).toHaveProperty("exec");
      expect(npm).toHaveProperty("lockfile");
      expect(npm).toHaveProperty("installFrozen");
      expect(npm).toHaveProperty("needsSetupAction");
      expect(npm).toHaveProperty("cacheKey");
    });

    it("should have all required fields for pnpm", () => {
      const pnpm = PACKAGE_MANAGERS.pnpm;

      expect(pnpm).toHaveProperty("name");
      expect(pnpm).toHaveProperty("install");
      expect(pnpm).toHaveProperty("run");
      expect(pnpm).toHaveProperty("exec");
      expect(pnpm).toHaveProperty("lockfile");
      expect(pnpm).toHaveProperty("installFrozen");
      expect(pnpm).toHaveProperty("needsSetupAction");
      expect(pnpm).toHaveProperty("cacheKey");
    });

    it("should have all required fields for yarn", () => {
      const yarn = PACKAGE_MANAGERS.yarn;

      expect(yarn).toHaveProperty("name");
      expect(yarn).toHaveProperty("install");
      expect(yarn).toHaveProperty("run");
      expect(yarn).toHaveProperty("exec");
      expect(yarn).toHaveProperty("lockfile");
      expect(yarn).toHaveProperty("installFrozen");
      expect(yarn).toHaveProperty("needsSetupAction");
      expect(yarn).toHaveProperty("cacheKey");
    });

    it("should have all required fields for yarn-berry", () => {
      const yarnBerry = PACKAGE_MANAGERS["yarn-berry"];

      expect(yarnBerry).toHaveProperty("name");
      expect(yarnBerry).toHaveProperty("install");
      expect(yarnBerry).toHaveProperty("run");
      expect(yarnBerry).toHaveProperty("exec");
      expect(yarnBerry).toHaveProperty("lockfile");
      expect(yarnBerry).toHaveProperty("installFrozen");
      expect(yarnBerry).toHaveProperty("needsSetupAction");
      expect(yarnBerry).toHaveProperty("cacheKey");
    });
  });
});
