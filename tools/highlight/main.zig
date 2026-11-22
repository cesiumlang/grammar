//! cesium-highlight [--wrap] [FILE]: Cesium source from FILE or standard
//! input, as HTML with class-based spans on standard output. With --wrap the
//! result is inside <pre class="highlight"><code class="language-cesium">.

const std = @import("std");
const highlight = @import("highlight");

const usage = "usage: cesium-highlight [--wrap] [FILE]\n";

pub fn main(init: std.process.Init) !void {
    const io = init.io;
    const gpa = init.gpa;
    const args = try init.minimal.args.toSlice(init.arena.allocator());

    var wrap = false;
    var path: ?[]const u8 = null;
    for (args[1..]) |arg| {
        if (std.mem.eql(u8, arg, "--wrap")) {
            wrap = true;
        } else if (std.mem.startsWith(u8, arg, "-") or path != null) {
            try std.Io.File.stderr().writeStreamingAll(io, usage);
            std.process.exit(2);
        } else {
            path = arg;
        }
    }

    const source = if (path) |p|
        try std.Io.Dir.cwd().readFileAlloc(io, p, gpa, .limited(1 << 26))
    else blk: {
        var buf: [4096]u8 = undefined;
        var reader = std.Io.File.stdin().readerStreaming(io, &buf);
        break :blk try reader.interface.allocRemaining(gpa, .limited(1 << 26));
    };
    defer gpa.free(source);

    var out_buf: [4096]u8 = undefined;
    var writer = std.Io.File.stdout().writerStreaming(io, &out_buf);
    const out = &writer.interface;

    var highlighter = try highlight.Highlighter.init();
    defer highlighter.deinit();

    if (wrap) try out.writeAll("<pre class=\"highlight\"><code class=\"language-cesium\">");
    try highlighter.writeHtml(gpa, source, out);
    if (wrap) try out.writeAll("</code></pre>\n");
    try out.flush();
}
