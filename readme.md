# Cesium Programming Language Specification

## Overview
Cesium is a compiled, statically-typed systems programming language focused on mathematical computing and linear algebra operations. It targets C ABI compatibility while providing modern language features and performance optimization capabilities.

## Core Philosophy
- Math-first language design with built-in mathematical operators
- Compile-time dispatch and optimization
- Explicit memory management with predictable performance
- Strong typing with safe implicit promotions only
- ASCII-only syntax for universal accessibility

## Type System

### Primitive Types
- Integer types: `u8`, `u16`, `u32`, `u64`, `i8`, `i16`, `i32`, `i64`
- Floating point: `f32`, `f64`
- Word-sized integer: `uword` (pointer-sized, maps to `u32`/`u64`)
- No separate `bool` or `char` types - use `u8`

### Composite Types
- Fixed arrays: `T[N]` (e.g., `i32[10]`)
- Array slices: `slice[T]` (non-owning views)
- Dynamic arrays: `list[T]` (owning, resizable)
- Hash maps: `dict[K,V]`
- Structs: `struct Name { ... }`
- Enums: `enum [Type] Name { ... }`
- Union types: `TypeA|TypeB` (defined via `alias`)
- Pointers: `#T` (pointer to type T)
- Strings: `str` (UTF-8 with explicit length, null-terminated internally)
- File paths: `path` (platform-agnostic path handling)
- File handles: `file`
- Error types: `error Name { ... }`

### SIMD Types
SIMD vectors use the `simd` qualifier with array notation:
```cesium
simd f32 vec[4];     // 4-element float vector
simd f64 data[8];    // 8-element double vector
```

### Type Conversion Rules
- **Implicit promotions**: `int` → `float`, smaller → larger of same signedness
- **Explicit conversions**: Use rounding functions `floor()`, `ceil()`, `round()`, `trunc()` for float→int
- **Bit reinterpretation**: `as` operator for same-size type reinterpretation
- **Mixed signed/unsigned**: Custom comparison logic preserving mathematical correctness
- **Literal typing**: Context-driven - literals adapt to assignment target when possible

## Variable Declarations

### Basic Syntax
```cesium
i32 x = 42;           // explicit type
const i32 y := 100;   // const with explicit type (note := operator)
```

### Qualifiers
- `const` - immutable after initialization (uses `:=` operator)
- `static` - function-scoped persistence or class-shared variables
- `private` - module-internal visibility
- `secret` - class-internal only (not accessible to subclasses)
- `volatile` - prevents compiler optimizations
- `atomic` - thread-safe operations
- `register` - optimization hint for register allocation
- `simd` - SIMD vector type qualifier

## Function Declarations

### Basic Syntax
```cesium
return_type = function_name(param_type param_name) {
    return value;
}

// Multiple return values
i32, f64 = multiple_returns(i32 x) {
    return x * 2, x * 3.14;
}

// No return value
void = no_return_func() {
    // statements only
}
```

### Function Qualifiers
- `static` - no implicit `this` parameter (required if `this` not used)
- `private` - module-internal function
- `secret` - class-internal function
- `operator` - operator overload function
- `context` - context manager functions (for `with` blocks)
- `property` - getter/setter functions

### Variadic Functions
```cesium
// Cesium-style (type-safe, becomes slice internally)
void = print_values(...i32 numbers) {
    for (uword i = 0..numbers.len) {
        printf("{}\n", numbers[i]);
    }
}

// C-style (for extern functions only)
extern libc = import('c') {
    i32 = printf(str fmt, ...);
}
```

### Generic Functions
```cesium
generic<T> T = max(T a, T b) {
    return a > b ? a : b;
}

generic<numeric T> T = dot_product(slice[T] a, slice[T] b) {
    T sum = 0;
    for (uword i = 0..a.len) {
        sum += a[i] * b[i];
    }
    return sum;
}
```

## Operators

### Arithmetic Operators (by precedence, highest first)
1. `()` `[]` `.` - grouping, indexing, member access
2. `~` (postfix) - matrix transpose
3. `::` (prefix) - square root, `n :: x` - nth root
4. `^` - exponentiation (right-associative)
5. `*` `/` `%` `@` - multiplication/division/modulus/cross product
6. `+` `-` - addition/subtraction
7. `<<` `>>` - bit shifts

### Context-Aware Multiplication (`*`)
- `scalar * scalar` → numeric multiplication
- `matrix * matrix` → matrix multiplication  
- `matrix * vector` → matrix-vector multiplication
- `vector * vector` → dot product
- `scalar * vector/matrix` → scalar multiplication

### Comparison and Logical
8. `<` `<=` `>` `>=` - comparisons
9. `==` `!=` - equality
10. `&` - bitwise AND
11. `><` - bitwise XOR  
12. `|` - bitwise OR
13. `&&` - logical AND
14. `||` - logical OR

### Assignment
15. `=` `:=` and compound assignments (`+=`, `-=`, etc.)
16. `,` - sequencing

### Pointer Operations
- `#` prefix for pointers: `#var` (address-of), `#type` (pointer type)
- Default dereference: pointer variables automatically dereference
- Address context: `#` prefix on operators for pointer arithmetic
- Context escape: `()` creates value context within pointer context
- Address forcing: `addrcontext(var)` forces address interpretation

### Custom Operators
- Predefined operators can be overloaded
- Custom operators use `$name$` syntax
- Example: `result = a $cross$ b`

## Control Flow

### Conditional Statements
```cesium
if (condition) {
    // statements
} else if (condition2) {
    // statements  
} else {
    // statements
}
```

### Loops
```cesium
// While loop
while (condition) {
    // statements
}

// Do-while loop  
do {
    // statements
} while (condition);

// For loop with ranges
for (i32 i = 0..10) {        // exclusive end: 0,1,2...9
    // statements
}

for (i32 i = 0..=10) {       // inclusive end: 0,1,2...10
    // statements  
}

for (i32 i = 0..2..=10) {    // step 2: 0,2,4,6,8,10
    // statements
}

// For loop with arrays/slices
for (i32 val = array) {
    // val gets each array element
}
```

### Pattern Matching

#### Switch Statements
```cesium
switch (value) {
    case (1) { /* statements */ }
    case (2, 3) { /* multiple values */ }
    case (5..7) { /* range */ }
    case (TypeA|TypeB) { /* type union */ }
    else { /* default */ }
}

// Optional fallthrough behavior
fallthrough switch (value) {
    case (1) { /* falls through */ }
    case (2) { break; }  // explicit break
}
```

#### Error Handling
```cesium
// Basic catch
f = file('test.txt') catch {
    printf("File operation failed");
}

// Pattern matching catch
f = file('test.txt') catch (err) {
    case (FileNotFound) { printf("Not found: {}", err.path); }
    case (AccessDenied) { printf("Access denied"); }
    else { printf("Other error"); }
}
```

### Control Keywords
- `break` - exit loop or switch
- `continue` - next loop iteration
- `return` - function return
- `defer` - execute at function exit (LIFO order)

## Resource Management

### Memory Management
```cesium
#i32 ptr = alloc(100);           // allocate array of 100 i32s
#i32 zeros = alloc(100, 0);      // allocate and initialize to 0
free(ptr);                       // deallocate
copy(dest, src, count);          // memory copy
```

### Context Managers
```cesium
// Define context manager
file = context enter(str path) { /* open file */ }
void = context exit(file f) { /* close file */ }

// Use with 'with' block
with f = file('data.txt') {
    data = read(f);
    // exit() called automatically
} catch (err) {
    case (FileNotFound) { /* handle error */ }
}
```

## Object-Oriented Programming

### Struct Definition
```cesium
struct Point {
    f64 x = 0.0, y = 0.0;    // fields with defaults
    private f64 internal;     // private field
    secret f64 truly_private; // not accessible to subclasses
    
    // Constructor
    Point(f64 px, f64 py) {
        x = px;
        y = py;
    }
    
    // Destructor  
    ~Point() {
        // cleanup
    }
    
    // Static method
    static Point = origin() {
        return Point(0.0, 0.0);
    }
    
    // Instance method
    f64 = distance() {
        return ::(x^2 + y^2);
    }
}
```

### Inheritance
```cesium
// Single inheritance
struct Point3(Point) {
    f64 z = 0.0;
    
    Point3(f64 px, f64 py, f64 pz) {
        super Point(px, py);  // parent constructor
        z = pz;
    }
    
    ~Point3() {
        // local cleanup first
        super ~Point();       // then parent cleanup
    }
}

// Multiple inheritance (left-to-right, rightmost wins conflicts)
struct Diamond(Left, Right) {
    Diamond() {
        super Left();
        super Right();
    }
    
    // Override method resolution
    i32 = Left.some_method;  // use Left's version instead of Right's
}
```

### Properties
```cesium
struct Circle {
    private f64 radius;
    
    // Getter
    f64 = property area() {
        return 3.14159 * radius^2;
    }
    
    // Setter (returns assigned value)
    f64 = property.set radius(f64 r) {
        this.radius = r;
        return r;
    }
}

// Usage: circle.area, circle.radius = 5.0
```

### Traits
```cesium
trait Numeric {
    type = add(type other);
    type = multiply(type other);
}

impl Numeric(f64) {
    type = add(type other) { return this + other; }
    type = multiply(type other) { return this * other; }
}

impl Numeric(Vec3) {
    type = add(type other) { 
        return Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
}
```

## Error Handling

### Error Types
```cesium
error FileNotFound {
    str path;
    i32 errno;
}

error AccessDenied {
    str message;
}

// Union types for multiple errors
alias FileError = FileNotFound|AccessDenied|IOError;
```

### Error Propagation and Handling
Functions returning errors use union return types. The `catch` construct handles errors with pattern matching and implicit `typeof()` checking.

## Module System and Imports

### Namespace Declaration
Files can declare custom namespaces or use default file-based namespacing.

### Import Syntax
```cesium
// Cesium modules
import(mylib) { func1; func2 as f2 }
builtins = import(std.builtin)

// External C libraries
extern libc = import('c') {
    i32 = printf(str fmt, ...);
    #void = malloc(uword size) as malloc;  // global alias
    export void = free(#void ptr);         // import as global name
}
```

### Export Rules
- Items are public by default within modules
- `private` restricts to module scope
- `secret` restricts to class scope only
- Exported functions to C get automatic wrapper generation for Cesium variadics

## String Interpolation
Backtick strings support expression interpolation:
```cesium
str name = "world";  
i32 count = 42;
str message = `Hello, {name}! Count: {count}`;
```

## Inline Assembly
Raw assembly blocks using Intel syntax:
```cesium
volatile u64 timestamp;
asm {
    rdtsc
    shl rdx, 32  
    or rax, rdx
    mov timestamp, rax
}
```

## Built-in Functions and I/O
- `printf()` - formatted output (defaults to stdout)
- `debugf()` - shortcut for `printf(stderr, ...)`
- `sizeof()` - type/variable size
- `typeof()` - type introspection
- Standard streams: `stdout`, `stdin`, `stderr`
- Math functions: `sin()`, `cos()`, `floor()`, `ceil()`, `round()`, `trunc()` (all built-ins, shadowable)

## Reserved Keywords

### Control Flow
`if`, `while`, `for`, `else`, `do`, `with`, `defer`, `break`, `continue`, `switch`, `case`, `fallthrough`

### Function Qualifiers  
`operator`, `context`, `property`, `private`, `secret`, `static`

### Language Constructs
`alias`, `catch`, `as`, `return`, `comptime`, `generic`, `sizeof`, `typeof`, `asm`

### Memory Management
`alloc`, `free`

### Core Types
`file`, `str`, `list`, `dict`, `slice`, `struct`, `void`, `enum`, `path`, `error`, `uword`

### Variable Qualifiers
`const`, `static`, `private`, `secret`, `volatile`, `atomic`, `register`, `simd`

### C Interop
`extern`, `export`  

### OOP Constructs
`trait`, `impl`, `type`, `this`, `super`

### Namespacing
`std`, `namespace`

### Built-in Functions/Streams
`printf`, `debugf`, `assert`, `stdout`, `stdin`, `stderr`

## Compilation Model
- Ahead-of-time compilation to native code
- Static dispatch only (no virtual functions)
- Compile-time generics instantiation  
- Multiple dispatch resolution at compile time
- Target: C ABI compatibility
- Backend: Zig-based code generation (initially)

## File Extensions
- Source files: `.cesium` or `.cs`
- Module interface files: `.m`
- Generated C headers: `.h` (optional, via compiler flag)

## Standard Library Organization
Mathematical functions, container operations, and I/O utilities accessible via `std.builtin` namespace when shadowed by user definitions.
