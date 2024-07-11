module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          /**
           * eg breaking: 🐙 this will cause x, y and z to break
           * semantic-release includes the option to add 'BREAKING' in the commit body, which will also
           * bump a major version, but this is less obvious.
           */
          { type: "breaking", scope: "*", release: "major" },
          { type: "feat", scope: "*", release: "minor" },
          { type: "fix", scope: "*", release: "patch" },
          { type: "perf", scope: "*", release: "patch" },
          { type: "docs", scope: "*", release: "patch" },
          { type: "style", scope: "*", release: "patch" },
          { type: "chore", scope: "*", release: "patch" },
          { type: "refactor", scope: "*", release: "patch" },
          { type: "test", scope: "*", release: "patch" },
          { type: "ci", scope: "*", release: "patch" },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "breaking:"],
        },
      },
    ],

    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        presetConfig: {
          // no need to include 'breaking' in the release notes
          types: [
            {
              type: "feat",
              section: "Features",
            },
            {
              type: "fix",
              section: "Bug Fixes",
            },
            {
              type: "perf",
              section: "Performance Improvements",
            },
            {
              type: "docs",
              section: "Documentation",
            },
            {
              type: "style",
              section: "Styles",
            },
            {
              type: "chore",
              section: "Miscellaneous Chores",
            },
            {
              type: "refactor",
              section: "Code Refactors",
            },
            {
              type: "test",
              section: "Tests",
            },
            {
              type: "ci",
              section: "CI/CD",
            },
            {
              type: "breaking",
              section: "Breaking",
            },
          ],
        },
      },
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
      },
    ],
    "@semantic-release/git",
    "@semantic-release/github",
  ],
};
