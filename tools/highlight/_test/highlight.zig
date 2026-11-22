const std = @import("std");
const highlight = @import("highlight");

fn render(gpa: std.mem.Allocator, source: []const u8) ![]u8 {
    var highlighter = try highlight.Highlighter.init();
    defer highlighter.deinit();
    var aw: std.Io.Writer.Allocating = .init(gpa);
    defer aw.deinit();
    try highlighter.writeHtml(gpa, source, &aw.writer);
    return aw.toOwnedSlice();
}

test "declaration with a number" {
    const html = try render(std.testing.allocator, "i32 x = 1;");
    defer std.testing.allocator.free(html);
    try std.testing.expectEqualStrings(
        "<span class=\"type builtin\">i32</span> <span class=\"variable\">x</span> " ++
            "<span class=\"operator\">=</span> <span class=\"number\">1</span>" ++
            "<span class=\"punctuation delimiter\">;</span>",
        html,
    );
}

test "text is escaped and an escape sequence is its own span" {
    const html = try render(std.testing.allocator, "str s = \"a<b\\n\";");
    defer std.testing.allocator.free(html);
    try std.testing.expect(std.mem.indexOf(u8, html, "a&lt;b") != null);
    try std.testing.expect(std.mem.indexOf(u8, html, "<span class=\"string escape\">\\n</span>") != null);
}

test "a builtin function is told from a call by the any-of predicate" {
    const html = try render(std.testing.allocator, "void = f() { alloc(1); g(2); }");
    defer std.testing.allocator.free(html);
    try std.testing.expect(std.mem.indexOf(u8, html, "<span class=\"function builtin\">alloc</span>") != null);
    try std.testing.expect(std.mem.indexOf(u8, html, "<span class=\"function call\">g</span>") != null);
}
