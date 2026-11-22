const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const ts_dep = b.dependency("tree_sitter", .{ .target = target, .optimize = optimize });

    // The generated parser (src/parser.c) is plain C.
    const parser_mod = b.createModule(.{
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    });
    parser_mod.addCSourceFile(.{
        .file = b.path("src/parser.c"),
        .flags = &.{"-std=c11"},
    });
    parser_mod.addIncludePath(b.path("src"));
    const parser_lib = b.addLibrary(.{
        .name = "tree-sitter-cesium",
        .linkage = .static,
        .root_module = parser_mod,
    });

    const highlight_mod = b.addModule("highlight", .{
        .root_source_file = b.path("tools/highlight/highlight.zig"),
        .target = target,
        .optimize = optimize,
    });
    highlight_mod.addAnonymousImport("highlights.scm", .{
        .root_source_file = b.path("queries/highlights.scm"),
    });
    highlight_mod.linkLibrary(ts_dep.artifact("tree-sitter"));
    highlight_mod.linkLibrary(parser_lib);

    const exe = b.addExecutable(.{
        .name = "cesium-highlight",
        .root_module = b.createModule(.{
            .root_source_file = b.path("tools/highlight/main.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{.{ .name = "highlight", .module = highlight_mod }},
        }),
    });
    b.installArtifact(exe);

    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("tools/highlight/_test/highlight.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{.{ .name = "highlight", .module = highlight_mod }},
        }),
    });
    b.step("test", "Run the highlighter tests").dependOn(&b.addRunArtifact(tests).step);
}
