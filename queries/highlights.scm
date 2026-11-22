; Highlight queries for Cesium. Only the predicates #eq? and #any-of? are
; used, so a highlighter needs no regular expression engine.

(comment) @comment
(doc_comment) @comment.documentation

(string_literal) @string
(interpolated_string) @string
(char_literal) @string.character
(string_content) @string
(escape_sequence) @string.escape

(integer_literal) @number
(float_literal) @number.float
(boolean_literal) @constant.builtin
(null) @constant.builtin
(undefined) @constant.builtin
(this) @variable.builtin
(super) @variable.builtin

; types
(primitive_type) @type.builtin
(builtin_type) @type.builtin
(type (qualified_name (identifier) @type))
(type_suffix (type (qualified_name (identifier) @type)))
(struct_declaration name: (identifier) @type)
(error_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(union_declaration name: (identifier) @type)
(alias_declaration name: (identifier) @type)
(trait_declaration name: (identifier) @type)
(impl_declaration trait: (identifier) @type)
(struct_literal type: (qualified_name (identifier) @type))
(cast_expression type: (type (qualified_name (identifier) @type)))
(generic_clause (identifier) @type)
(enumerator name: (identifier) @constant)

; functions
(function_definition name: (identifier) @function)
(constructor_definition name: (identifier) @constructor)
(destructor_definition name: (identifier) @constructor)
(call_expression function: (identifier) @function.call)
(call_expression function: (member_expression member: (identifier) @function.method))
(generic_call_expression function: (identifier) @function.call)
(super_call (identifier) @constructor)
(call_expression
  function: (identifier) @function.builtin
  (#any-of? @function.builtin
    "alloc" "free" "realloc" "addrcontext" "printf" "debugf" "assert"
    "floor" "ceil" "trunc" "round" "trueround" "abs" "min" "max" "mean" "norm"))

; variables
(parameter name: (identifier) @variable.parameter)
(member_expression member: (identifier) @property)
(field_declaration name: (identifier) @property)
(field_initializer name: (identifier) @property)
(declarator name: (identifier) @variable)
(namespace_declaration name: (qualified_name (identifier) @namespace))
(import_declaration (qualified_name (identifier) @namespace))
(extern_declaration name: (identifier) @namespace)

; keywords
[
  "if" "else" "while" "for" "do" "switch" "case" "fallthrough" "return"
  "break" "continue" "defer" "with" "throw" "catch"
] @keyword.control

[
  "struct" "enum" "union" "error" "alias" "trait" "impl" "namespace"
  "extern" "import" "generic" "operator" "context" "property" "destruct"
  "comptime" "sizeof" "typeof" "as"
] @keyword

(qualifier) @keyword.modifier

; operators and punctuation
(pointer_sigil) @operator
(custom_operator) @operator
(assign_operator) @operator
(binary_expression operator: _ @operator)
(unary_expression operator: _ @operator)
(postfix_expression operator: _ @operator)
(ternary_expression ["?" ":"] @operator)

["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," ";" "." "::" ":" "..."] @punctuation.delimiter
