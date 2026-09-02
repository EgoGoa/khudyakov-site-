// Flat config, reading eslint-config-next's own flat exports directly.
//
// This used to go through `FlatCompat` from @eslint/eslintrc, which is the
// bridge for consuming OLD-style (.eslintrc) shareable configs from a flat
// config. That bridge is what broke linting entirely: @eslint/eslintrc does
// `import minimatch from "minimatch"`, and minimatch 10 dropped its default
// export, so every eslint run died at startup with
//   SyntaxError: The requested module 'minimatch' does not provide an export
//   named 'default'
// before it ever looked at a source file.
//
// eslint-config-next 16 ships real flat configs at ./core-web-vitals and
// ./typescript (each exporting a Linter.Config[]), so the compat layer has
// nothing left to translate — importing them straight removes the dependency
// on @eslint/eslintrc, and with it the broken transitive import.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "_backups/**",
      ".next/**",
      "next-env.d.ts",
      // Plain Node tooling, not app code. These are CommonJS by design, so
      // linting them with the TypeScript/Next rulesets reported 17 errors for
      // `require()` calls that are simply correct in a .cjs script — noise
      // that buries the findings worth acting on.
      "**/*.cjs",
      "create-docx.js",
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
