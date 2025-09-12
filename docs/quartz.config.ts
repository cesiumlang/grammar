import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { QuartzTransformerPlugin } from "./quartz/plugins/types"
import rehypePrettyCode from "rehype-pretty-code"
import * as fs from "fs"
import * as path from "path"

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
            defaultLang: "cesium", // Simplified - both block and inline default to cesium
            onVisitHighlightedWord(node: any) {
              console.log("📝 Processing highlighted word:", node)
            },
            transformers: [{
              name: 'cesium-block-detector',
              code(node: any) {
                console.log("🎯 Code block detected:")
                console.log("  - tagName:", node.tagName)
                console.log("  - properties:", node.properties)
                console.log("  - data attributes:", Object.keys(node.properties || {}).filter(k => k.startsWith('data')))

                if (node.properties?.['data-language'] === 'cesium' ||
                    node.properties?.className?.includes('cesium')) {
                  console.log("🎉 CESIUM CODE BLOCK FOUND!")
                }
              }
            }],
            onVisitLine(node: any) {
              // Log when we're processing code lines - look at data attributes too
              console.log("🔍 Processing line with:")
              console.log("  - className:", node.properties?.className)
              console.log("  - data-language:", node.properties?.['data-language'])
              console.log("  - all properties:", Object.keys(node.properties || {}))

              if (node.properties?.className?.includes('cesium') ||
                  node.properties?.['data-language'] === 'cesium') {
                console.log("🖍️  Processing Cesium code line")
              }
            },
            onVisitHighlightedLine(node: any) {
              if (node.properties?.className?.includes('cesium') ||
                  node.properties?.['data-language'] === 'cesium') {
                console.log("✨ Highlighted Cesium code line")
              }
            },
            onVisitHighlightedChars(node: any) {
              if (node.properties?.className?.includes('cesium') ||
                  node.properties?.['data-language'] === 'cesium') {
                console.log("🎨 Highlighted Cesium code chars")
              }
            },
            ...userOpts,
            // Custom getHighlighter function for Cesium language support
            // see: https://rehype-pretty.pages.dev/#custom-highlighter
            getHighlighter: async (options: any) => {
              const { getHighlighter } = await import("shiki")

              return getHighlighter({
                ...options,
                langs: [
                  "plaintext",
                  // Load cesium grammar as async function following rehype docs pattern
                  async () => {
                    // Path to the Cesium TextMate grammar file at workspace root.
                    // Don't forget this file in Git is only one level down from the
                    // repo root, but this file gets copied to quartz_repo during
                    // the build action, so the path needs an extra ../ here.
                    const grammarPath = path.resolve("../../cesium.tmGrammar.json")
                    console.log("📁 Loading cesium grammar from:", grammarPath)

                    try {
                      const grammar = JSON.parse(fs.readFileSync(grammarPath, "utf-8"))
                      console.log("✅ Cesium grammar loaded successfully!")
                      console.log("📝 Grammar name:", grammar.name)
                      console.log("🏷️  Grammar scopeName:", grammar.scopeName)
                      return grammar
                    } catch (error) {
                      console.warn("❌ Failed to load cesium grammar:", error)
                      throw error
                    }
                  },
                ],
              })
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
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      // Use custom Cesium syntax highlighting AFTER markdown processing
      CesiumSyntaxHighlighting(),
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
