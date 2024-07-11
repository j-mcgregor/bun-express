module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    [
      "@semantic-release/github",
      {
        successComment: false,
        failTitle: false,
      },
    ],
  ],
  preset: "angular",
  releaseRules: [
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
};
