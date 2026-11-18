# Cesium grammar files

Grammar files and other resources for syntax highlighters of the [Cesium programming language](https://cesiumlang.org).

## Contents

| Path | What |
| --- | --- |
| `cesium.tmGrammar.json` | TextMate grammar, scope `source.cesium`, for `.csm` source files and `.csi` module interface files |
| `github-linguist/languages.yml` | The entry for Cesium in the format of [GitHub Linguist](https://github.com/github-linguist/linguist) |
| `tests/` | Highlighting tests: Cesium files annotated with the scopes each token must get |
| `package.json` | Declares the language and the grammar the way a VS Code extension does, and the test scripts |

The [cesiumlang.org](https://github.com/cesiumlang/cesiumlang.org) site uses the grammar, as a submodule, to highlight code blocks.

## Tests

The tests run with [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) and need Node.js.

```sh
npm ci
npm test
```

`npm run test:snap` writes the scopes of every token of the test files to `.snap` files, which helps when writing new assertions. Git ignores them.

## Status

The language is still being designed, and the grammar follows the recorded decisions in the [cesium](https://github.com/cesiumlang/cesium/issues?q=is%3Aissue+label%3Adecision) repository. Where the grammar and the language reference disagree, see this repository's issues.
