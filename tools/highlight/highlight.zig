//! Cesium source to HTML: one `<span class="...">` per highlighted token,
//! found with the Tree-sitter grammar and `queries/highlights.scm`. The
//! capture name becomes the classes, split at the dots (`keyword.control`
//! becomes `class="keyword control"`), so the colors are a style sheet.
//!
//! Predicates of the queries: `#eq?`, `#not-eq?` and `#any-of?` only.

const std = @import("std");
const ts = @import("ts.zig");

const highlights_scm = @embedFile("highlights.scm");

pub const Error = error{
    OutOfMemory,
    LanguageVersionMismatch,
    QueryInvalid,
    SourceTooLarge,
    ParseFailed,
    WriteFailed,
};

const Span = struct {
    start: u32,
    end: u32,
    pattern: u16,
    capture: u32,

    // outer spans first; among equal ranges the earliest pattern is painted last, so it wins
    fn lessThan(_: void, a: Span, b: Span) bool {
        if (a.start != b.start) return a.start < b.start;
        if (a.end != b.end) return a.end > b.end;
        return a.pattern > b.pattern;
    }
};

pub const Highlighter = struct {
    parser: *ts.Parser,
    query: *ts.Query,
    cursor: *ts.QueryCursor,

    pub fn init() Error!Highlighter {
        const language = ts.tree_sitter_cesium();
        const parser = ts.ts_parser_new() orelse return error.OutOfMemory;
        errdefer ts.ts_parser_delete(parser);
        if (!ts.ts_parser_set_language(parser, language)) return error.LanguageVersionMismatch;

        var error_offset: u32 = 0;
        var error_type: ts.QueryError = .none;
        const query = ts.ts_query_new(language, highlights_scm.ptr, highlights_scm.len, &error_offset, &error_type) orelse
            return error.QueryInvalid;
        errdefer ts.ts_query_delete(query);

        const cursor = ts.ts_query_cursor_new() orelse return error.OutOfMemory;
        return .{ .parser = parser, .query = query, .cursor = cursor };
    }

    pub fn deinit(self: *Highlighter) void {
        ts.ts_query_cursor_delete(self.cursor);
        ts.ts_query_delete(self.query);
        ts.ts_parser_delete(self.parser);
        self.* = undefined;
    }

    /// Writes `source` to `out` as HTML-escaped text with spans.
    pub fn writeHtml(self: *Highlighter, gpa: std.mem.Allocator, source: []const u8, out: *std.Io.Writer) Error!void {
        if (source.len > std.math.maxInt(u32)) return error.SourceTooLarge;
        const tree = ts.ts_parser_parse_string(self.parser, null, source.ptr, @intCast(source.len)) orelse
            return error.ParseFailed;
        defer ts.ts_tree_delete(tree);

        var spans: std.ArrayList(Span) = .empty;
        defer spans.deinit(gpa);

        ts.ts_query_cursor_exec(self.cursor, self.query, ts.ts_tree_root_node(tree));
        var match: ts.QueryMatch = undefined;
        while (ts.ts_query_cursor_next_match(self.cursor, &match)) {
            if (!self.predicatesHold(match, source)) continue;
            for (match.captures[0..match.capture_count]) |capture| {
                try spans.append(gpa, .{
                    .start = ts.ts_node_start_byte(capture.node),
                    .end = ts.ts_node_end_byte(capture.node),
                    .pattern = match.pattern_index,
                    .capture = capture.index,
                });
            }
        }
        std.mem.sort(Span, spans.items, {}, Span.lessThan);

        // the capture of each byte, plus one; 0 is none
        const painted = try gpa.alloc(u32, source.len);
        defer gpa.free(painted);
        @memset(painted, 0);
        for (spans.items) |span| @memset(painted[span.start..span.end], span.capture + 1);

        var i: usize = 0;
        while (i < source.len) {
            const kind = painted[i];
            var j = i + 1;
            while (j < source.len and painted[j] == kind) j += 1;
            if (kind != 0) {
                try out.writeAll("<span class=\"");
                try self.writeClasses(out, kind - 1);
                try out.writeAll("\">");
            }
            try writeEscaped(out, source[i..j]);
            if (kind != 0) try out.writeAll("</span>");
            i = j;
        }
    }

    fn writeClasses(self: *const Highlighter, out: *std.Io.Writer, capture: u32) Error!void {
        var len: u32 = 0;
        const name = ts.ts_query_capture_name_for_id(self.query, capture, &len)[0..len];
        for (name) |c| try out.writeByte(if (c == '.') ' ' else c);
    }

    fn predicatesHold(self: *const Highlighter, match: ts.QueryMatch, source: []const u8) bool {
        var count: u32 = 0;
        const steps = ts.ts_query_predicates_for_pattern(self.query, match.pattern_index, &count)[0..count];
        var i: usize = 0;
        while (i < steps.len) {
            var j = i;
            while (j < steps.len and steps[j].type != .done) j += 1;
            if (!self.predicateHolds(steps[i..j], match, source)) return false;
            i = j + 1;
        }
        return true;
    }

    fn predicateHolds(self: *const Highlighter, steps: []const ts.PredicateStep, match: ts.QueryMatch, source: []const u8) bool {
        if (steps.len < 2 or steps[0].type != .string) return true;
        const name = self.stringValue(steps[0].value_id);
        const subject = self.operand(steps[1], match, source);
        if (std.mem.eql(u8, name, "any-of?")) {
            for (steps[2..]) |step| {
                if (std.mem.eql(u8, subject, self.stringValue(step.value_id))) return true;
            }
            return false;
        }
        if (steps.len < 3) return true;
        const equal = std.mem.eql(u8, subject, self.operand(steps[2], match, source));
        if (std.mem.eql(u8, name, "eq?")) return equal;
        if (std.mem.eql(u8, name, "not-eq?")) return !equal;
        return true;
    }

    // the text of a captured node, or a string of the query
    fn operand(self: *const Highlighter, step: ts.PredicateStep, match: ts.QueryMatch, source: []const u8) []const u8 {
        if (step.type == .string) return self.stringValue(step.value_id);
        for (match.captures[0..match.capture_count]) |capture| {
            if (capture.index == step.value_id) {
                return source[ts.ts_node_start_byte(capture.node)..ts.ts_node_end_byte(capture.node)];
            }
        }
        return "";
    }

    fn stringValue(self: *const Highlighter, id: u32) []const u8 {
        var len: u32 = 0;
        return ts.ts_query_string_value_for_id(self.query, id, &len)[0..len];
    }
};

fn writeEscaped(out: *std.Io.Writer, text: []const u8) Error!void {
    var start: usize = 0;
    for (text, 0..) |c, i| {
        const entity = switch (c) {
            '&' => "&amp;",
            '<' => "&lt;",
            '>' => "&gt;",
            else => continue,
        };
        try out.writeAll(text[start..i]);
        try out.writeAll(entity);
        start = i + 1;
    }
    try out.writeAll(text[start..]);
}
