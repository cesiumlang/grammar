import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { QuartzTransformerPlugin } from "./quartz/plugins/types"
import rehypePrettyCode from "rehype-pretty-code"

// Custom Cesium Syntax Highlighting Plugin
const CesiumSyntaxHighlighting: QuartzTransformerPlugin<any> = (userOpts = {}) => {
  return {
    name: "CesiumSyntaxHighlighting",
    htmlPlugins() {
      return [
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark",
            },
            keepBackground: true,
            onVisitLine(node: any) {
              // Log when we're processing code lines
              console.log("🔍 Processing line with className:", node.properties?.className)
              if (node.properties?.className?.includes('cesium')) {
                console.log("🖍️  Processing Cesium code line")
              }
            },
            onVisitHighlightedLine(node: any) {
              if (node.properties?.className?.includes('cesium')) {
                console.log("✨ Highlighted Cesium code line")
              }
            },
            onVisitHighlightedChars(node: any) {
              if (node.properties?.className?.includes('cesium')) {
                console.log("🎨 Highlighted Cesium code chars")
              }
            },
            ...userOpts,
            // Custom getHighlighter function for Cesium language support
            getHighlighter: async (options: any) => {
              console.log("🔍 CesiumSyntaxHighlighting: getHighlighter called")
              console.log("📋 Options received:", JSON.stringify(options, null, 2))

              const { getHighlighter } = await import("shiki")
              const fs = await import("fs")
              const path = await import("path")

              // Path to the Cesium TextMate grammar file at workspace root.
              // Don't forget this file in Git is only one level down from the
              // repo root, but this file gets copied to quartz_repo during
              // the build action, so the path needs an extra ../ here.
              const grammarPath = path.resolve("../../cesium.tmGrammar.json")
              console.log("📁 Looking for grammar at:", grammarPath)

              try {
                const cesiumGrammar = JSON.parse(fs.readFileSync(grammarPath, "utf-8"))
                console.log("✅ Cesium grammar loaded successfully!")
                console.log("📝 Grammar name:", cesiumGrammar.name)
                console.log("🏷️  Grammar scopeName:", cesiumGrammar.scopeName)

                console.log("🔧 Raw grammar object keys:", Object.keys(cesiumGrammar))

                const highlighter = await getHighlighter({
                  ...options,
                  langs: [
                    ...(options.langs || []),
                    // Try direct grammar registration
                    cesiumGrammar
                  ]
                })

                console.log("🎨 Highlighter created with languages:", highlighter.getLoadedLanguages())

                // Test if cesium language is actually available
                try {
                  const testCode = "const x: i32 = 42;"
                  const highlighted = highlighter.codeToHtml(testCode, {
                    lang: 'cesium',
                    themes: {
                      light: 'github-light',
                      dark: 'github-dark'
                    }
                  })
                  console.log("🧪 Test highlighting successful for cesium language")
                } catch (testError) {
                  console.warn("⚠️  Test highlighting failed:", testError)
                }

                return highlighter
              } catch (error) {
                console.warn("❌ Failed to load Cesium grammar, using default languages:", error)
                return await getHighlighter(options)
              }
            },
          }
        ]
      ]
    },
  }
}

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Cesium Programming Language",
    pageTitleSuffix: " | Cesium Programming Language",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    // {
    //   provider: "plausible",
    // },
    locale: "en-US",
    baseUrl: "cesiumlang.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        // title: "Schibsted Grotesk",
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      // Use custom Cesium syntax highlighting instead of Plugin.SyntaxHighlighting
      CesiumSyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({ maxDepth: 6 }),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
