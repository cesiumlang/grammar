; Tags for Cesium: the definitions an outline lists and go to definition
; finds, and the references to them (`tree-sitter tags`; test/tags/).

; definitions
(function_definition name: (identifier) @name) @definition.function
(constructor_definition name: (identifier) @name) @definition.constructor
(destructor_definition name: (identifier) @name) @definition.destructor
(struct_declaration name: (identifier) @name) @definition.struct
(error_declaration name: (identifier) @name) @definition.struct
(enum_declaration name: (identifier) @name) @definition.enum
(enumerator name: (identifier) @name) @definition.constant
(union_declaration name: (identifier) @name) @definition.type
(alias_declaration name: (identifier) @name) @definition.type
(trait_declaration name: (identifier) @name) @definition.interface
(namespace_declaration name: (qualified_name) @name) @definition.module
(extern_declaration name: (identifier) @name) @definition.module
(import_declaration namespace: (identifier) @name) @definition.module
(field_declaration name: (identifier) @name) @definition.field
; a member read as a declaration, as after an error in the line before
(member_block
  (variable_declaration
    (declarator name: (identifier) @name) @definition.field))

; globals and constants: declarations at the top level only (a tags query
; takes no capture of its own, so `const` is not told apart)
(source_file
  (variable_declaration
    (declarator name: (identifier) @name) @definition.variable))

; references
(call_expression function: (identifier) @name) @reference.call
(call_expression function: (member_expression member: (identifier) @name)) @reference.call
(type (qualified_name (identifier) @name)) @reference.type
