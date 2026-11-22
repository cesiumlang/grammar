//! The part of the Tree-sitter C API (v0.27) that the highlighter uses.
//! Declared by hand: it is a small surface, and it keeps the build free of
//! translate-c.

pub const Language = opaque {};
pub const Parser = opaque {};
pub const Tree = opaque {};
pub const Query = opaque {};
pub const QueryCursor = opaque {};

pub const Node = extern struct {
    context: [4]u32,
    id: ?*const anyopaque,
    tree: ?*const Tree,
};

pub const QueryCapture = extern struct {
    node: Node,
    index: u32,
};

pub const QueryMatch = extern struct {
    id: u32,
    pattern_index: u16,
    capture_count: u16,
    captures: [*]const QueryCapture,
};

pub const PredicateStepType = enum(c_uint) { done, capture, string };

pub const PredicateStep = extern struct {
    type: PredicateStepType,
    value_id: u32,
};

pub const QueryError = enum(c_uint) { none, syntax, node_type, field, capture, structure, language };

pub extern fn tree_sitter_cesium() *const Language;

pub extern fn ts_parser_new() ?*Parser;
pub extern fn ts_parser_delete(parser: *Parser) void;
pub extern fn ts_parser_set_language(parser: *Parser, language: *const Language) bool;
pub extern fn ts_parser_parse_string(parser: *Parser, old_tree: ?*const Tree, string: [*]const u8, length: u32) ?*Tree;
pub extern fn ts_tree_root_node(tree: *const Tree) Node;
pub extern fn ts_tree_delete(tree: *Tree) void;
pub extern fn ts_node_start_byte(node: Node) u32;
pub extern fn ts_node_end_byte(node: Node) u32;

pub extern fn ts_query_new(language: *const Language, source: [*]const u8, source_len: u32, error_offset: *u32, error_type: *QueryError) ?*Query;
pub extern fn ts_query_delete(query: *Query) void;
pub extern fn ts_query_capture_name_for_id(query: *const Query, index: u32, length: *u32) [*]const u8;
pub extern fn ts_query_predicates_for_pattern(query: *const Query, pattern_index: u32, step_count: *u32) [*]const PredicateStep;
pub extern fn ts_query_string_value_for_id(query: *const Query, index: u32, length: *u32) [*]const u8;

pub extern fn ts_query_cursor_new() ?*QueryCursor;
pub extern fn ts_query_cursor_delete(cursor: *QueryCursor) void;
pub extern fn ts_query_cursor_exec(cursor: *QueryCursor, query: *const Query, node: Node) void;
pub extern fn ts_query_cursor_next_match(cursor: *QueryCursor, match: *QueryMatch) bool;
