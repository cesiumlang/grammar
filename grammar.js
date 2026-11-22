/**
 * Tree-sitter grammar for Cesium (cesiumlang/grammar#10).
 *
 * Exact for S0 (cesiumlang.org/spec/s0-grammar) and tolerant of the forms of
 * the full language that the reference pages use; those are not decided, so
 * they are accepted loosely and may change. The TextMate grammar remains for
 * editors without Tree-sitter.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assign: 0,
  or: 1,
  and: 2,
  bit_or: 3,
  bit_xor: 4,
  bit_and: 5,
  equal: 6,
  relational: 7,
  range: 8,
  shift: 9,
  additive: 10,
  multiplicative: 11,
  power: 12,
  root: 13,
  cast: 14,
  unary: 15,
  postfix: 16,
};

/** @param {RuleOrLiteral} rule */
const commaSep1 = (rule) => seq(rule, repeat(seq(',', rule)));
/** @param {RuleOrLiteral} rule */
const commaSep = (rule) => optional(commaSep1(rule));

module.exports = grammar({
  name: 'cesium',

  extras: ($) => [/\s/, $.comment, $.doc_comment],

  word: ($) => $.identifier,

  supertypes: ($) => [$._expression, $._statement, $._declaration],

  conflicts: ($) => [
    // conflicts:begin
    [$.qualified_name, $._expression],
    [$._declaration, $._statement],
    [$._base_type, $._expression],
    [$.qualified_name],
    [$.type],
    [$.case_clause, $.parenthesized_expression],
    [$.field_declaration, $.declarator],
    [$.field_declaration, $.assign_operator],
    [$.pointer_sigil, $.unary_expression],
    [$._expression, $.generic_call_expression],
    [$.block, $.initializer_list],
    [$.binary_expression, $.unary_expression, $.postfix_expression],
    [$._with_clause, $.parenthesized_expression],
    [$.binary_expression, $.postfix_expression],
    [$.import_declaration],
    [$.import_declaration, $.import_expression],
    [$.super_call, $.super],
    [$._statement, $._expression],
    // conflicts:end
  ],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) => choice($._declaration, $._statement),

    // ---- comments -------------------------------------------------------

    comment: () =>
      token(
        choice(
          seq('//', /[^\n]*/),
          seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
        ),
      ),

    doc_comment: () =>
      token(prec(1, seq('/**', /[^*]*\*+([^/*][^*]*\*+)*/, '/'))),

    // ---- declarations ---------------------------------------------------

    _declaration: ($) =>
      choice(
        $.struct_declaration,
        $.error_declaration,
        $.enum_declaration,
        $.union_declaration,
        $.alias_declaration,
        $.trait_declaration,
        $.impl_declaration,
        $.namespace_declaration,
        $.extern_declaration,
        $.destructor_definition,
        $.comptime_block,
        $.import_declaration,
        $.function_definition,
        $.variable_declaration,
      ),

    qualifier: () =>
      choice(
        'const',
        'static',
        'private',
        'secret',
        'volatile',
        'atomic',
        'register',
        'simd',
        'export',
      ),

    struct_declaration: ($) =>
      seq(
        repeat($.qualifier),
        'struct',
        field('name', $.identifier),
        optional($.generic_clause),
        optional(seq('(', commaSep($.type), ')')),
        field('body', $.member_block),
      ),

    error_declaration: ($) =>
      seq('error', field('name', $.identifier), field('body', $.member_block)),

    member_block: ($) => seq('{', repeat($._member), '}'),

    _member: ($) =>
      choice(
        $.constructor_definition,
        $.field_declaration,
        $.function_definition,
        $.destructor_definition,
        $.variable_declaration,
        $.comptime_block,
      ),

    field_declaration: ($) =>
      seq(
        repeat($.qualifier),
        field('type', $.type),
        field('name', $.identifier),
        optional(seq('[', optional($._expression), ']')),
        optional(seq('=', $._expression)),
        ';',
      ),

    enum_declaration: ($) =>
      seq(
        'enum',
        optional($.primitive_type),
        field('name', $.identifier),
        '{',
        repeat(choice($.enumerator, ',', ';')),
        '}',
      ),

    enumerator: ($) =>
      seq(field('name', $.identifier), optional(seq('=', $._expression))),

    union_declaration: ($) =>
      seq(
        'union',
        field('name', $.identifier),
        '=',
        $.union_type,
        ';',
      ),

    union_type: ($) => seq($.type, repeat1(seq('|', $.type))),

    alias_declaration: ($) =>
      seq('alias', field('name', $.identifier), '=', $.type, ';'),

    trait_declaration: ($) =>
      seq(
        'trait',
        field('name', $.identifier),
        optional($.generic_clause),
        field('body', $.member_block),
      ),

    impl_declaration: ($) =>
      seq(
        'impl',
        field('trait', $.identifier),
        optional(seq('(', commaSep($.type), ')')),
        field('body', $.member_block),
      ),

    namespace_declaration: ($) =>
      seq(
        'namespace',
        field('name', $.qualified_name),
        choice(seq('{', repeat($._item), '}'), ';'),
      ),

    extern_declaration: ($) =>
      seq(
        'extern',
        field('name', $.identifier),
        '=',
        $.import_expression,
        '{',
        repeat($.function_definition),
        '}',
      ),

    comptime_block: ($) => seq('comptime', $.block),

    generic_clause: ($) =>
      seq(
        'generic',
        '<',
        commaSep1(seq(optional($.identifier), $.identifier)),
        '>',
      ),

    // A function: ret_type = name(params) block (S0 3.4). The return type
    // may be several types or an error union.
    function_definition: ($) =>
      seq(
        repeat($.qualifier),
        optional($.generic_clause),
        field('return_type', $.return_types),
        '=',
        field('name', $._function_name),
        field('parameters', $.parameter_list),
        field('body', choice($.block, seq(optional(seq('as', $.identifier)), ';'))),
      ),

    constructor_definition: ($) =>
      seq(
        field('name', $.identifier),
        field('parameters', $.parameter_list),
        field('body', $.block),
      ),

    import_declaration: ($) =>
      seq(
        'import',
        '(',
        choice($.char_literal, $.qualified_name),
        ')',
        optional(
          seq(
            '{',
            repeat(seq($.identifier, optional(seq('as', $.identifier)), optional(';'))),
            '}',
          ),
        ),
        optional(';'),
      ),

    destructor_definition: ($) =>
      seq(
        'destruct',
        field('name', $.identifier),
        field('parameters', $.parameter_list),
        field('body', $.block),
      ),

    return_types: ($) =>
      seq($.type, repeat(seq(choice(',', '|'), $.type))),

    _function_name: ($) =>
      choice(
        seq(optional('#'), $.identifier),
        seq(
          'operator',
          choice(
            $.custom_operator,
            '+', '-', '*', '/', '%', '@', '^', '**', '::', '<<', '>>',
            '<', '>', '<=', '>=', '==', '!=', '&', '|', '><', '!', '~',
            seq('[', ']'),
          ),
        ),
        seq('context', $.identifier),
        seq(
          'property',
          optional(seq('.', $.identifier)),
          optional('#'),
          $.identifier,
        ),
      ),

    parameter_list: ($) => seq('(', commaSep($.parameter), ')'),

    parameter: ($) =>
      choice(
        seq(
          optional('...'),
          field('type', $.type),
          field('name', $.identifier),
          repeat(seq('[', optional($._expression), ']')),
          optional(seq('=', $._expression)),
        ),
        '...',
      ),

    // ---- types ----------------------------------------------------------

    type: ($) =>
      seq(
        repeat($.pointer_sigil),
        $._base_type,
        repeat($.type_suffix),
      ),

    _type: ($) => $.type,

    pointer_sigil: () => prec(PREC.unary, choice('#', '~', ':#', ':~')),

    _base_type: ($) =>
      choice(
        $.primitive_type,
        $.builtin_type,
        $.qualified_name,
        $.typeof_expression,
      ),

    type_suffix: ($) =>
      seq('[', commaSep(choice($.type, $.integer_literal)), ']'),

    primitive_type: () => token(prec(1, /[ui][0-9]+|f(16|32|64|128)|uword|void|bool/)),

    builtin_type: () => choice('file', 'str', 'list', 'dict', 'slice', 'path'),

    qualified_name: ($) =>
      seq($.identifier, repeat(seq(choice('.', '::'), $.identifier))),

    // ---- statements -----------------------------------------------------

    _statement: ($) =>
      choice(
        $.block,
        $.variable_declaration,
        $.assignment,
        $.if_statement,
        $.while_statement,
        $.do_statement,
        $.for_statement,
        $.switch_statement,
        $.case_clause,
        $.with_statement,
        $.defer_statement,
        $.return_statement,
        $.throw_statement,
        $.break_statement,
        $.continue_statement,
        $.fallthrough_statement,
        $.else_clause,
        $.catch_statement,
        $.ellipsis,
        $.expression_statement,
        ';',
      ),

    block: ($) => seq('{', repeat($._item), '}'),

    variable_declaration: ($) =>
      seq(
        repeat($.qualifier),
        field('type', $.type),
        commaSep1($.declarator),
        ';',
      ),

    declarator: ($) =>
      seq(
        field('name', $.identifier),
        repeat(seq('[', optional($._expression), ']')),
        optional($.argument_list),
        optional(seq(field('operator', $.assign_operator), field('value', $._expression))),
      ),

    assign_operator: () =>
      choice(
        '=',
        ':=',
        '#=',
        '~=',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '^=',
        '&=',
        '|=',
        '><=',
        '<<=',
        '>>=',
        '**=',
      ),

    assignment: ($) =>
      seq(
        field('left', $._expression),
        field('operator', $.assign_operator),
        field('right', $._expression),
        ';',
      ),

    expression_statement: ($) => seq($._expression, ';'),

    if_statement: ($) =>
      prec.right(
        seq(
          'if',
          field('condition', $.parenthesized_expression),
          field('consequence', $.block),
          optional(
            seq('else', field('alternative', choice($.block, $.if_statement))),
          ),
        ),
      ),

    else_clause: ($) => seq('else', $.block),

    while_statement: ($) =>
      seq(
        'while',
        field('condition', $.parenthesized_expression),
        field('body', $.block),
      ),

    do_statement: ($) =>
      seq(
        'do',
        field('body', $.block),
        'while',
        field('condition', $.parenthesized_expression),
        ';',
      ),

    for_statement: ($) =>
      seq(
        'for',
        '(',
        optional(
          choice(
            seq(
              field('type', $.type),
              field('name', $.identifier),
              '=',
              $._expression,
            ),
            seq(
              optional($._expression),
              repeat(seq(';', optional($._expression))),
            ),
          ),
        ),
        ')',
        field('body', $.block),
      ),

    switch_statement: ($) =>
      seq(
        optional('fallthrough'),
        'switch',
        field('value', $.parenthesized_expression),
        field('body', $.block),
      ),

    case_clause: ($) =>
      seq(
        'case',
        choice(
          seq('(', commaSep(choice($.union_type, $.type, $._expression)), ')'),
          $._expression,
        ),
        choice($.block, ':'),
      ),

    with_statement: ($) =>
      seq(
        'with',
        choice(seq('(', $._with_clause, ')'), $._with_clause),
        $.block,
        optional($.catch_clause),
      ),

    _with_clause: ($) =>
      choice(
        seq(optional($.type), $.identifier, '=', $._expression),
        $._expression,
      ),

    defer_statement: ($) => seq('defer', choice($.block, seq($._expression, ';'))),

    return_statement: ($) =>
      seq('return', optional(commaSep1($._expression)), ';'),

    throw_statement: ($) => seq('throw', $._expression, ';'),

    break_statement: () => seq('break', ';'),

    continue_statement: () => seq('continue', ';'),

    fallthrough_statement: () => seq('fallthrough', ';'),

    // ---- expressions ----------------------------------------------------

    _expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.postfix_expression,
        $.cast_expression,
        $.call_expression,
        $.index_expression,
        $.member_expression,
        $.struct_literal,
        $.initializer_list,
        $.ternary_expression,
        $.generic_call_expression,
        $.ellipsis,
        $.super_call,
        $.sizeof_expression,
        $.typeof_expression,
        $.import_expression,
        $.parenthesized_expression,
        $.identifier,
        $.this,
        $.super,
        $._literal,
      ),

    binary_expression: ($) => {
      /** @type {Array<[number, RuleOrLiteral]>} */
      const table = [
        [PREC.or, '||'],
        [PREC.and, '&&'],
        [PREC.bit_or, '|'],
        [PREC.bit_xor, '><'],
        [PREC.bit_and, '&'],
        [PREC.equal, choice('==', '!=')],
        [PREC.relational, choice('<', '>', '<=', '>=')],
        [PREC.range, choice('..', '..=')],
        [PREC.shift, choice('<<', '>>')],
        [PREC.additive, choice('+', '-', '#+', '#-', '~+', '~-')],
        [PREC.multiplicative, choice('*', '/', '%', '@', $.custom_operator)],
        [PREC.root, '::'],
      ];
      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field('left', $._expression),
              field('operator', operator),
              field('right', $._expression),
            ),
          ),
        ),
        prec.right(
          PREC.power,
          seq(
            field('left', $._expression),
            field('operator', choice('^', '**')),
            field('right', $._expression),
          ),
        ),
      );
    },

    unary_expression: ($) =>
      prec(
        PREC.unary,
        seq(
          field('operator', choice('#', '~', '!', '-', '+', '..', '::', $.custom_operator)),
          field('operand', $._expression),
        ),
      ),

    postfix_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field('operand', $._expression),
          field('operator', choice('~', '..', '#++', '#--', '~++', '~--', '++', '--')),
        ),
      ),

    cast_expression: ($) =>
      prec.left(
        PREC.cast,
        seq(field('value', $._expression), 'as', field('type', $.type)),
      ),

    catch_clause: ($) =>
      seq(
        'catch',
        optional(seq('(', $.identifier, ')')),
        field('handler', $.block),
      ),

    catch_statement: ($) =>
      seq(field('value', $._expression), $.catch_clause),

    call_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field('function', $._expression),
          field('arguments', $.argument_list),
        ),
      ),

    argument_list: ($) => seq('(', commaSep($._expression), ')'),

    index_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field('value', $._expression),
          '[',
          optional($._expression),
          ']',
        ),
      ),

    member_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field('value', $._expression),
          '.',
          field('member', $.identifier),
        ),
      ),

    struct_literal: ($) =>
      seq(
        field('type', $.qualified_name),
        '{',
        commaSep(choice($.field_initializer, $._expression)),
        optional(','),
        '}',
      ),

    field_initializer: ($) =>
      seq(field('name', $.identifier), '=', field('value', $._expression)),

    sizeof_expression: ($) => seq('sizeof', '(', choice($.type, $._expression), ')'),

    typeof_expression: ($) => seq('typeof', '(', $._expression, ')'),

    import_expression: ($) => seq('import', '(', $.char_literal, ')'),

    parenthesized_expression: ($) => seq('(', $._expression, ')'),

    initializer_list: ($) => seq('{', commaSep($._expression), optional(','), '}'),

    ternary_expression: ($) =>
      prec.right(
        PREC.assign,
        seq(
          field('condition', $._expression),
          '?',
          field('consequence', $._expression),
          ':',
          field('alternative', $._expression),
        ),
      ),

    generic_call_expression: ($) =>
      prec.dynamic(
        1,
        seq(
          field('function', $.identifier),
          '<',
          commaSep1($.type),
          '>',
          field('arguments', $.argument_list),
        ),
      ),

    ellipsis: () => '...',

    super_call: ($) =>
      seq('super', optional($.identifier), $.argument_list),

    this: () => 'this',
    super: () => 'super',

    custom_operator: () => token(/\$[A-Za-z_][A-Za-z0-9_]*\$/),

    // ---- literals -------------------------------------------------------

    _literal: ($) =>
      choice(
        $.integer_literal,
        $.float_literal,
        $.char_literal,
        $.string_literal,
        $.interpolated_string,
        $.boolean_literal,
        $.null,
        $.undefined,
      ),

    integer_literal: () =>
      token(
        choice(
          /0[xX][0-9a-fA-F_]+/,
          /0[bB][01_]+/,
          /0[oO][0-7_]+/,
          /[0-9][0-9_]*/,
        ),
      ),

    float_literal: () =>
      token(prec(1, /[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9]+)?/)),

    // also the library name of import('c'), which is written the same way
    char_literal: ($) =>
      seq(
        "'",
        repeat(choice($.escape_sequence, alias(/[^'\\\n]+/, $.string_content))),
        "'",
      ),

    string_literal: ($) =>
      seq(
        '"',
        repeat(choice($.escape_sequence, alias(/[^"\\\n]+/, $.string_content))),
        '"',
      ),

    interpolated_string: ($) =>
      seq(
        '`',
        repeat(
          choice(
            $.escape_sequence,
            alias(/[^`\\{]+/, $.string_content),
            $.interpolation,
          ),
        ),
        '`',
      ),

    interpolation: ($) => seq('{', $._expression, '}'),

    escape_sequence: () =>
      token.immediate(
        seq('\\', choice(/[nrt0"'`\\{}]/, /u\{[0-9a-fA-F]+\}/, /x[0-9a-fA-F]{2}/)),
      ),

    boolean_literal: () => choice('true', 'false'),
    null: () => 'null',
    undefined: () => 'undefined',

    identifier: () => /[A-Za-z_][A-Za-z0-9_]*/,
  },
});
