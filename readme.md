# Cesium grammar files

Grammar files and other resources for syntax highlighters of the [Cesium programming language](https://cesiumlang.org).

## Contents

| Path | What |
| --- | --- |
| `cesium.tmGrammar.json` | TextMate grammar, scope `source.cesium`, for `.csm` source files and `.csi` module interface files |
| `github-linguist/languages.yml` | The entry for Cesium in the format of [GitHub Linguist](https://github.com/github-linguist/linguist) |
| `grammar.js` | The [Tree-sitter](https://tree-sitter.github.io) grammar (`tree_sitter_cesium`): exact for S0, tolerant of the forms of the full language that the reference pages use |
| `src/` | What `tree-sitter generate` writes from `grammar.js` (`parser.c` and the rest); committed so that nothing needs Node.js to build the parser. Never edit it by hand |
| `queries/highlights.scm` | The highlight queries: capture names such as `keyword.control` and `function.builtin`. Only the predicates `#eq?`, `#not-eq?` and `#any-of?` are used |
| `test/corpus/` | Tree-sitter tests: the expected syntax tree of S0 programs and of the full-language forms |
| `tools/highlight/` | `cesium-highlight`, a Zig program that writes Cesium source as HTML with one `<span class="...">` per token (`keyword.control` is `class="keyword control"`), so colors are a style sheet; also a library module, `highlight` |
| `build.zig` | Builds the highlighter; the Tree-sitter runtime is a pinned dependency |
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

## Tree-sitter grammar

The tree-sitter CLI is in [cesium-buildtools](https://github.com/cesiumlang/cesium-buildtools) (`opt/tree-sitter-0.27.2`).

```sh
tree-sitter generate   # grammar.js to src/parser.c
tree-sitter test       # test/corpus
zig build test         # the highlighter
zig build              # zig-out/bin/cesium-highlight
```

`cesium-highlight [--wrap] [FILE]` reads standard input when there is no file. After a change of `grammar.js`, run `tree-sitter generate` and commit what it writes.

## Status

The language is still being designed, and the grammar follows the recorded decisions in the [cesium](https://github.com/cesiumlang/cesium/issues?q=is%3Aissue+label%3Adecision) repository. Where the grammar and the language reference disagree, see this repository's issues.
