# Cesium Programming Language Specification v0.1

## Table of Contents

1. [Overview](#overview)
2. [Lexical Structure](#lexical-structure)
3. [Type System](#type-system)
4. [Variables and Constants](#variables-and-constants)
5. [Operators and Expressions](#operators-and-expressions)
6. [Control Flow](#control-flow)
7. [Functions](#functions)
8. [Memory Management](#memory-management)
9. [Object-Oriented Programming](#object-oriented-programming)
10. [Error Handling](#error-handling)
11. [Modules and Imports](#modules-and-imports)
12. [Built-in Functions](#built-in-functions)
13. [Inline Assembly](#inline-assembly)
14. [Grammar Reference](#grammar-reference)

## Overview

Cesium is a compiled, statically-typed systems programming language designed for mathematical computing and linear algebra applications. It prioritizes performance, explicit memory management, and mathematical expressiveness while maintaining C ABI compatibility.

The language borrows design and syntactic elements from languages as varied as Python, Fortran, Rust, Go, Odin, and C++, but ultimately derives the bulk of its original design inspiration and goals from C, Zig, and MATLAB.  As such, an early placeholder name for the language was CZM for those three languages.

Ultimately, the name is a reference to the atomic element cesium (American Chemical Society spelling).  Since one of the primary objectives of the language is runtime performance, it seemed fitting to share a name with the primary element used for standard atomic clocks.  In fact, a second in timekeeping is officially defined in SI by assuming the unperturbed ground-state hyperfine transition frequency of the cesium-133 atom to be exactly 9,192,631,770 Hz.  It takes 34 bits to represent that number as an integer in binary.

### Design Goals

- Math-first language with built-in mathematical operators and types
- Compile-time dispatch and optimization
- Memory safety through ownership tracking and explicit management
- Strong typing with minimal implicit conversions
- ASCII-only syntax for universal accessibility
- C interoperability for existing library integration

### Basic Program Structure

```cesium
// hello.cs
void = main() {
    printf("Hello, Cesium!\n");
}
```

## Lexical Structure

### Comments

```cesium
// Single-line comment

/*
  Multi-line comment
*/

/// Documentation comment for functions
/// Multiple lines supported
void = documented_function() {
    // implementation
}
```

### Keywords

Cesium reserves the following keywords:

**Core Types:** `file`, `str`, `list`, `dict`, `slice`, `struct`, `path`, `uword`

**Language Constructs:** `alias`, `catch`, `as`, `return`, `comptime`, `generic`, `sizeof`, `typeof`, `asm`, `void`, `enum`, `error`, `null`, `union`

**Control Flow:** `if`, `while`, `for`, `else`, `do`, `with`, `defer`, `break`, `continue`, `switch`, `case`, `fallthrough`, `throw`

**Function Qualifiers:** `operator`, `context`, `property`, `private`, `secret`, `static`, `destruct`

**Variable Qualifiers:** `const`, `static`, `private`, `secret`, `volatile`, `atomic`, `register`, `simd`

**C Interop:** `extern`, `export`

**OOP Constructs:** `trait`, `impl`, `type`, `this`, `super`

**Namespacing:** `std`, `namespace`

### Built-in Functions and Constants

**Memory Management:** `alloc()`, `free()`, `realloc()`

**Debugging and I/O:** `printf()`, `debugf()`, `assert()`, `stdout`, `stdin`, `stderr`

**Mathematical:** `floor()`, `ceil()`, `trunc()`, `round()`, `trueround()`, `abs()`, `min()`, `max()`, `mean()`, `norm()`, `pi`

### Identifiers

Identifiers follow C-style rules: start with letter or underscore, followed by letters, digits, or underscores.

### String Literals and Interpolation

```cesium
str simple = "Hello, world!";
str interpolated = `Hello, {name}! You have {count} messages.`;
path file_path = path(`{home_dir}/config/settings.conf`);
```

## Type System

### Primitive Types

```cesium
// Integer types
u8 byte_val = 255;
u16 short_val = 65535;
u32 int_val = 4294967295;
u64 long_val = 18446744073709551615;
u34 arbitrary_bit_width = 9192631770;

i8 signed_byte = -128;
i16 signed_short = -32768;
i32 signed_int = -2147483648;
i64 signed_long = -9223372036854775808;
i34 signed_arbitrary_bit_width = -9192631770;

// Floating point
f16 small_float = 3.14;
f32 single = 3.14159;
f64 double = 3.141592653589793;
f128 quad;

// Word-sized integer (pointer-sized)
uword size = 1024;

// No separate bool or char - use u8
u8 is_valid = 1;  // true
u8 letter = 65;   // 'A'
u8 also_letter = 'A';
```

### Array Types

```cesium
// Fixed arrays
i32 numbers[10];
f64 matrix[3][3];  // 3x3 matrix

// Array type syntax (for function parameters)
void = process_data(f64 values[], uword count);

// Dynamic arrays
list[i32] dynamic_numbers;
slice[f64] array_view;  // non-owning view
```

### SIMD Types

```cesium
simd f32 vec4[4];     // 4-element float vector
simd f64 vec2[2];     // 2-element double vector
simd u32 vec8[8];     // 8-element integer vector

// SIMD operations work with existing operators
simd f32 a[4], b[4], result[4];
result = a + b;  // vectorized addition
```

### Pointer Types

```cesium
#i32 int_ptr;         // immutable pointer to i32
##i32 ptr_to_ptr;     // immutable pointer to immutable pointer to i32
~#i32 mut_ptr_to_ptr; // mutable pointer to immutable pointer to i32
#~i32 ptr_to_mut_ptr; // immutable pointer to mutable pointer to i32

// Ownership and borrowing
#Matrix m := create_matrix();     // owned value
#Matrix borrowed_m #= m;         // immutable borrow
~Matrix mutable_m #= m;          // mutable borrow
```

### User-Defined Types

```cesium
// Structs
struct Point {
    f64 x = 0.0;
    f64 y = 0.0;
}

// Enums with custom backing types
enum Status { OK; ERROR; PENDING; }
enum i16 ImportantYears { Y2K = 2000; TWO_BC = -1; }

// Error types
error FileNotFound {
    str path;
    i32 errno;
}

// Union types
union Number = i32|f64;
union FileErrors = AccessDenied|FileNotFound;
```

### Type Conversion Rules

```cesium
// Implicit promotions
i32 x = 42;
i34 y = x; // widening of same numeric class
f32 z = x;
f64 bigz = x; // int-to-float + widening

u32 a = 96;
u64 b = a; // widening of same numeric class
f64 c = a; // int-to-float + widening

f128 d = c; // widening of same numeric class

// Explicit conversions for narrowing
f64 pi = 3.14159;
i32 truncated = trunc(pi);  // use rounding functions

// Bit reinterpretation
u32 bits = 0x3F800000;
f32 float_val = bits as f32;

// Context-driven literal typing
u8 small = 255;      // 255 becomes u8
i16 medium = 255;    // 255 becomes i16
```

## Variables and Constants

### Variable Declaration

```cesium
// Basic declaration with no initialization
u8 x;

// Basic declaration with initialization
i32 count = 0;
f64 pi = 3.14159;

// Constant variables
const i32 MAX_SIZE = 1000;
const str VERSION = "1.0.0";

// Ownership assignment
Matrix m_owned := create_matrix();  // takes ownership
Matrix m_copy = owned;              // error - cannot copy owned value
Matrix m_moved := owned;      // explicit ownership transfer
```

### Qualifiers

```cesium
// Storage and access qualifiers
static i32 global_counter = 0;    // function-scoped persistence
private void = helper();          // module-internal function
secret i32 internal_state;       // class-internal only

// Hardware qualifiers
volatile u32 hardware_register;   // prevent optimization
atomic u64 shared_counter;        // thread-safe operations
register u64 hot_variable;        // register allocation hint
```

## Operators and Expressions

### Operator Precedence (highest to lowest)

```cesium
// 1. Primary expressions
result = func(a, b);      // function call
element = array[index];   // indexing
member = obj.field;       // member access

// 2. Custom unary operators
result = $negate$x;       // custom unary operator

// 3. Postfix operators
transposed = matrix~;     // matrix transpose

// 4. Unary prefix operators
addr = #variable;         // address-of
value = #pointer;         // dereference (auto in most contexts)
root = ::x;              // square root

// 5. Binary root operator
cube_root = 3::27;       // nth root

// 6. Exponentiation (right-associative)
power = base^exponent;

// 7. Multiplicative
product = a * b;         // context-aware multiplication
quotient = a / b;
remainder = a % b;
cross = vec1 @ vec2;     // cross product

// 8. String concatenation
message = "Hello" ** " " ** "World";

// 9. Additive
sum = a + b;
difference = a - b;

// 10. Bit shifts
shifted = value << 2;
shifted = value >> 1;

// 11. Comparison operators
less = a < b;
greater = a > b;
less_equal = a <= b;
greater_equal = a >= b;

// 12. Equality operators
equal = a == b;
not_equal = a != b;

// 13. Bitwise AND
masked = value & 0xFF;

// 14. Bitwise XOR
flipped = a >< b;

// 15. Bitwise OR
combined = flags | new_flag;

// 16. Logical AND
result = condition1 && condition2;

// 17. Logical OR
result = condition1 || condition2;

// 18. Custom binary operators
result = a $dot$ b;      // custom binary operator

// 19. Assignment
x = 42;
owned := create_value();
```

### Context-Aware Multiplication

```cesium
// Scalar multiplication
f64 scalar = 2.0;
f64 result = scalar * 3.14;

// Vector operations
vector[3] v1, v2;
f64 dot_product = v1 * v2;      // dot product
vector[3] cross_product = v1 @ v2;  // cross product

// Matrix operations
matrix[3,3] A, B;
matrix[3,3] C = A * B;          // matrix multiplication
vector[3] v = A * v1;           // matrix-vector multiplication

// Mixed operations
vector[3] scaled = 2.0 * v1;    // scalar-vector multiplication
```

### Bitwise Operations

```cesium
u32 flags = 0b11110000;
u32 mask = 0b00001111;

u32 masked = flags & mask;        // bitwise AND
u32 flipped = flags >< 0b11111111; // bitwise XOR (toggle bits)
u32 combined = flags | mask;       // bitwise OR
u32 shifted_left = flags << 2;     // left shift
u32 shifted_right = flags >> 2;    // right shift

// XOR for encryption/decryption
u8 data = 0x42;
u8 key = 0x5A;
u8 encrypted = data >< key;        // encrypt
u8 decrypted = encrypted >< key;   // decrypt (data == decrypted)
```

### Pointer Operations and Contexts

```cesium
i32 value = 42;
#i32 ptr = #value;              // address-of

// Default dereference - ptr automatically dereferenced
i32 copy = ptr;                 // gets value at ptr

// Address context for pointer arithmetic
#i32 incremented = ptr #+ 1;    // pointer arithmetic
i32 offset_value = (ptr #+ 2);  // value context within pointer context

// Explicit address context forcing
result = addrcontext(ptr) + offset;  // force address interpretation
```

## Control Flow

### Conditional Statements

```cesium
if (condition) {
    printf("Condition is true\n");
} else if (other_condition) {
    printf("Other condition is true\n");
} else {
    printf("No conditions met\n");
}
```

### Loops

```cesium
// While loop
i32 count = 0;
while (count < 10) {
    printf("Count: {}\n", count);
    count++;
}

// Do-while loop
do {
    input = get_user_input();
} while (input != "quit");

// For loops with ranges
for (i32 i = 0..10) {        // 0,1,2,...,9 (exclusive)
    printf("i = {}\n", i);
}

for (i32 i = 0..=10) {       // 0,1,2,...,10 (inclusive)
    printf("i = {}\n", i);
}

for (i32 i = 0..2..=10) {    // 0,2,4,6,8,10 (step 2)
    printf("i = {}\n", i);
}

// Iteration over collections
i32 numbers[5] = {1, 2, 3, 4, 5};
for (i32 value = numbers) {
    printf("Value: {}\n", value);
}
```

### Pattern Matching

```cesium
// Switch statements
switch (value) {
    case (1) { printf("One\n"); }
    case (2, 3) { printf("Two or Three\n"); }
    case (10..=20) { printf("Between 10 and 20\n"); }
    else { printf("Something else\n"); }
}

// Optional fallthrough
fallthrough switch (status) {
    case (STARTING) {
        initialize();
        // falls through
    }
    case (RUNNING) {
        process();
        break;  // explicit break
    }
    case (STOPPED) {
        cleanup();
    }
}

// Type matching
Number num = get_number();  // Number = i32|f64
switch (typeof(num)) {
    case (i32) {
        i32 val = num as i32;
        printf("Integer: {}\n", val);
    }
    case (f64) {
        f64 val = num as f64;
        printf("Float: {}\n", val);
    }
}
```

### Loop Control

```cesium
for (i32 i = 0..100) {
    if (i % 2 == 0) {
        continue;  // skip even numbers
    }
    if (i > 50) {
        break;     // exit loop
    }
    printf("{}\n", i);
}
```

## Functions

### Function Declaration

```cesium
// Basic function
i32 = add(i32 a, i32 b) {
    return a + b;
}

// Multiple return values
i32, f64 = divide_with_remainder(i32 dividend, i32 divisor) {
    return dividend / divisor, dividend % divisor;
}

// No return value
void = print_message(str message) {
    printf("{}\n", message);
}

// Function with ownership/borrowing
void = process_data(~Matrix data) {      // takes mutable borrow
    // can modify data in-place
    data.transpose();
}

Matrix = create_matrix(i32 rows, i32 cols) {
    Matrix result := alloc_matrix(rows, cols);  // returns owned value
    return result;
}
```

### Function Qualifiers

```cesium
struct Calculator {
    private f64 last_result;

    // Static method (no 'this' parameter)
    static Calculator = create() {
        return Calculator { last_result = 0.0 };
    }

    // Private method (module internal)
    private void = validate_input(f64 value) {
        assert(value >= 0.0);
    }

    // Secret method (class internal only)
    secret void = internal_operation() {
        // implementation details
    }
}
```

### Generic Functions

```cesium
// Basic generic function
generic<T> T = max(T a, T b) {
    return a > b ? a : b;
}

// Generic with trait constraints
generic<numeric T> T = dot_product(slice[T] a, slice[T] b) {
    assert(a.len == b.len);
    T sum = 0;
    for (uword i = 0..a.len) {
        sum += a[i] * b[i];
    }
    return sum;
}

// Multiple type parameters
generic<K, V> V = dict_get(dict[K,V] d, K key, V default_value) {
    // implementation
}

// Usage
f64 result = max(3.14, 2.71);           // T inferred as f64
i32 larger = max<i32>(10, 20);          // explicit type
```

### Variadic Functions

```cesium
// Cesium-style variadics (type-safe, becomes slice)
void = print_numbers(...i32 numbers) {
    for (uword i = 0..numbers.len) {
        printf("{} ", numbers[i]);
    }
    printf("\n");
}

// Usage
print_numbers(1, 2, 3, 4, 5);

// C-style variadics (for extern functions only)
extern libc = import('c') {
    i32 = printf(str fmt, ...);
}
```

### Operator Overloading

```cesium
// Built-in operator overloading
struct Vector3 {
    f64 x, y, z;

    // Overload addition operator
    Vector3 = operator +(Vector3 other) {
        return Vector3 {
            x = this.x + other.x,
            y = this.y + other.y,
            z = this.z + other.z
        };
    }

    // Overload multiplication for dot product
    f64 = operator *(Vector3 other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
}

// Custom operator definition
Vector3 = operator $cross$(Vector3 a, Vector3 b) {
    return Vector3 {
        x = a.y * b.z - a.z * b.y,
        y = a.z * b.x - a.x * b.z,
        z = a.x * b.y - a.y * b.x
    };
}

// Usage
Vector3 a, b, result;
result = a + b;          // uses overloaded +
f64 dot = a * b;         // uses overloaded *
Vector3 cross = a $cross$ b;  // uses custom operator
```

## Memory Management

### Basic Memory Operations

```cesium
// Allocation and deallocation
#i32 numbers = alloc(100);        // allocate array of 100 i32s
#f64 zeros = alloc(50, 0.0);      // allocate and initialize
free(numbers);                    // deallocate

// Reallocation (expand or relocate existing allocation)
numbers = realloc(numbers, 200);  // expand or move allocation
if (numbers == null) {
    // realloc failed, original memory still valid
}

// Memory copying
copy(destination, source, count); // built-in memory copy
```

### Automatic Resource Management

```cesium
// Defer statements (execute at function return)
void = process_file(str filename) {
    #u8 buffer = alloc(1024);
    defer free(buffer);           // executed when function returns

    if (some_condition) {
        return;  // defer executes here
    }

    // defer also executes at normal function end
}

// Defer with blocks
void = complex_processing() {
    defer {
        cleanup_temp_files();
        reset_global_state();
    };

    // multiple operations deferred together
}
```

### Context Managers

```cesium
// Define context manager for file handling
file = context enter(str path, str mode) {
    // open file and return handle
}

void = context exit(file f) {
    // close file automatically
}

// Usage with automatic cleanup
void = read_config() {
    with f = file("config.txt", "r") {
        data = read_all(f);
        process_config(data);
        // file automatically closed on exit
    } catch (err) {
        case (FileNotFound) {
            printf("Config file not found\n");
        }
    }
}
```

### Ownership and Borrowing

```cesium
// Ownership transfer
Matrix = create_identity(i32 size) {
    Matrix result := allocate_matrix(size, size);  // owned
    // ... initialize
    return result;  // ownership transferred to caller
}

// Borrowing for read-only access
f64 = calculate_determinant(#Matrix m) {
    // can read m, cannot modify
    // caller retains ownership
}

// Mutable borrowing for in-place operations
void = transpose_inplace(~Matrix m) {
    // exclusive access to modify m
    // caller retains ownership after function returns
}

// Usage
Matrix mat := create_identity(3);           // takes ownership
f64 det = calculate_determinant(#mat);      // lends for reading
transpose_inplace(~mat);                    // lends for modification
// mat still owned and valid here
```

## Object-Oriented Programming

### Struct Definition and Usage

```cesium
struct Point {
    f64 x = 0.0;
    f64 y = 0.0;
    private f64 internal_id;     // accessible to subclasses
    secret f64 truly_private;    // not accessible to subclasses

    // Constructor
    Point(f64 px, f64 py) {
        x = px;
        y = py;
        internal_id = generate_id();
    }

    // Destructor
    destruct Point() {
        cleanup_resources();
    }

    // Static method
    static Point = origin() {
        return Point(0.0, 0.0);
    }

    // Instance method
    f64 = distance_from_origin() {
        return ::(x^2 + y^2);  // sqrt of sum of squares
    }

    // Method with mutable access
    void = translate(f64 dx, f64 dy) {
        x += dx;
        y += dy;
    }
}

// Usage
Point p1(3.0, 4.0);
Point origin = Point.origin();      // static method call
f64 dist = p1.distance_from_origin();
p1.translate(1.0, -1.0);
```

### Inheritance

```cesium
// Single inheritance
struct Point3D(Point) {
    f64 z = 0.0;

    Point3D(f64 px, f64 py, f64 pz) {
        super Point(px, py);  // call parent constructor
        z = pz;
    }

    destruct Point3D() {
        // local cleanup
        super ~Point();       // call parent destructor
    }

    // Override parent method
    f64 = distance_from_origin() {
        return ::(x^2 + y^2 + z^2);
    }
}

// Multiple inheritance
struct ColoredPoint(Point, Colored) {
    ColoredPoint(f64 x, f64 y, Color c) {
        super Point(x, y);     // left-to-right constructor calls
        super Colored(c);
    }

    // Method resolution override (use Point's version instead of Colored's)
    str = Point.to_string;
}
```

### Properties

```cesium
struct Circle {
    private f64 radius;

    // Getter property
    f64 = property area() {
        return 3.14159 * radius^2;
    }

    // Setter property (returns assigned value for chaining)
    f64 = property.set radius(f64 r) {
        assert(r >= 0.0);
        this.radius = r;
        return r;  // enables: x = circle.radius = 5.0
    }

    // Read-only property (getter only)
    f64 = property circumference() {
        return 2.0 * 3.14159 * radius;
    }
}

// Usage
Circle c;
c.radius = 5.0;              // calls setter
f64 area = c.area;           // calls getter
// c.circumference = 10.0;   // error: read-only property
```

### Traits and Implementation

```cesium
// Define trait interface
trait Drawable {
    void = draw();
    void = resize(f64 scale);

    // Default implementation
    void = highlight() {
        printf("Highlighting drawable object\n");
    }
}

trait Comparable {
    i32 = compare(type other);  // type refers to implementing type
}

// Implement traits for types
impl Drawable(Circle) {
    void = draw() {
        printf("Drawing circle with radius {}\n", this.radius);
    }

    void = resize(f64 scale) {
        this.radius *= scale;
    }

    // highlight() uses default implementation
}

impl Comparable(Circle) {
    i32 = compare(Circle other) {
        if (this.radius < other.radius) return -1;
        if (this.radius > other.radius) return 1;
        return 0;
    }
}

// Generic functions using traits
generic<Drawable T> void = render_object(T obj) {
    obj.draw();
    obj.highlight();
}
```

## Error Handling

### Error Type Definition

```cesium
// Define error types
error FileNotFound {
    str path;
    i32 errno;
}

error AccessDenied {
    str message;
    i32 permission_level;
}

error NetworkTimeout {
    str host;
    i32 timeout_ms;
}

// Error union types
alias FileError = FileNotFound|AccessDenied;
alias IOError = FileError|NetworkTimeout;
```

### Error Propagation Methods

```cesium
// Return errors (exits function immediately)
FileError|file = open_file(str path) {
    if (!file_exists(path)) {
        return FileNotFound { path = path, errno = 2 };
    }
    if (!has_permission(path)) {
        return AccessDenied { message = "Read permission denied", permission_level = 0 };
    }

    file handle = create_file_handle(path);
    return handle;  // success case
}

// Throw errors (continues execution, collected for later handling)
void = batch_process_files(str[] file_paths) {
    for (str path = file_paths) {
        if (!validate_path(path)) {
            throw FileNotFound { path = path, errno = 404 };
            continue;  // process remaining files
        }

        if (!check_permissions(path)) {
            throw AccessDenied { message = "Cannot access file", permission_level = 1 };
            continue;
        }

        process_single_file(path);
    }
    // All thrown errors handled by catch after function completes
}
```

### Error Handling with Catch

```cesium
// Basic error catching
file_or_error = open_file("data.txt");
file_or_error catch {
    printf("Failed to open file\n");
}

// Pattern matching on error types
file_or_error catch (err) {
    case (FileNotFound) {
        printf("File not found: {}\n", err.path);
        create_default_file(err.path);
    }
    case (AccessDenied) {
        printf("Access denied: {}\n", err.message);
        request_elevated_permissions();
    }
}

// Multiple error types
file_or_error catch (err) {
    case (FileNotFound|AccessDenied) {
        printf("File access error: cannot open file\n");
    }
    case (NetworkTimeout) {
        printf("Network timeout accessing {}\n", err.host);
    }
    else {
        printf("Unknown error occurred\n");
    }
}

// Catching thrown errors from batch operations
batch_process_files(file_list) catch (err) {
    case (FileNotFound) {
        printf("Skipped missing file: {}\n", err.path);
    }
    case (AccessDenied) {
        printf("Permission denied for file\n");
    }
}
```

### Error Handling with Context Managers

```cesium
// Combining with resource management
with f = file("data.txt", "r") {
    data = read_all(f);
    result = process_data(data);
    return result;
} catch (err) {
    case (FileNotFound) {
        printf("Input file missing\n");
        return default_result();
    }
    case (AccessDenied) {
        printf("Cannot read input file\n");
        return error_result();
    }
}
// file automatically closed even if errors occur
```

## Modules and Imports

### Module Structure

```cesium
// File: math/vector.cesium
namespace math.vector;

// Public interface
struct Vector3 {
    f64 x, y, z;

    Vector3 = operator +(Vector3 other) {
        return Vector3 { x + other.x, y + other.y, z + other.z };
    }
}

f64 = magnitude(Vector3 v) {
    return ::(v.x^2 + v.y^2 + v.z^2);
}

// Private helper function
private f64 = square(f64 x) {
    return x * x;
}
```

### Import Syntax

```cesium
// Import entire modules
import(math.vector);
import(std.io) as io;

// Selective imports
import(math.matrix) { Matrix; multiply as mat_mult; invert };
import(graphics.primitives) {
    Circle;
    Rectangle as Rect;
    export Triangle;  // import as global name
}

// Using imported functions
Vector3 v1, v2;
Vector3 sum = math.vector.add(v1, v2);
Matrix m = mat_mult(matrix1, matrix2);
Triangle tri;  // globally available due to 'export'
```

### External Library Integration

```cesium
// Import C libraries
extern libc = import('c') {
    i32 = printf(str fmt, ...);
    #void = malloc(uword size) as malloc;  // global alias
    export void = free(#void ptr);         // import as global
}

extern math_lib = import('m') {
    f64 = sin(f64 x);
    f64 = cos(f64 x);
    f64 = sqrt(f64 x) as sqrt;
}

// Platform-specific imports
extern windows = import('kernel32') {
    i32 = GetCurrentProcessId();
    void = Sleep(u32 milliseconds);
}

extern posix = import('unistd') {
    i32 = getpid();
    i32 = sleep(u32 seconds);
}

// Usage
void = cross_platform_delay(u32 ms) {
    comptime {
        if (target_os == "windows") {
            windows.Sleep(ms);
        } else {
            posix.sleep(ms / 1000);
        }
    }
}
```

### Module Interface Files

```cesium
// math_vector.m (module interface file)
namespace math.vector;

// Public type declarations
struct Vector3 {
    f64 x, y, z;
    // method signatures without implementation
    Vector3 = operator +(Vector3 other);
}

// Public function signatures
f64 = magnitude(Vector3 v);
Vector3 = normalize(Vector3 v);
Vector3 = cross_product(Vector3 a, Vector3 b);
```

## Built-in Functions

### I/O Functions

```cesium
// Formatted output
printf("Hello, {}!\n", name);                    // stdout
printf(stderr, "Error: {}\n", error_message);    // explicit stream
debugf("Debug info: value = {}\n", debug_value); // stderr shortcut

// Standard streams
file output = stdout;
file input = stdin;
file errors = stderr;
```

### Mathematical Functions

```cesium
// Trigonometric functions (built-in, shadowable)
f64 angle = 1.57;
f64 sine = sin(angle);
f64 cosine = cos(angle);
f64 tangent = tan(angle);

// Rounding functions (required for float->int conversion)
f64 value = 3.7;
i32 down = floor(value);    // 3
i32 up = ceil(value);       // 4
i32 nearest = round(value); // 4
i32 toward_zero = trunc(value); // 3

// Root functions (also available as operators)
f64 square_root = sqrt(25.0);  // or ::25.0
f64 cube_root = cbrt(27.0);    // or 3::27.0
```

### Type Introspection

```cesium
// Type and size information
uword int_size = sizeof(i32);           // 4
uword array_size = sizeof(numbers);     // total array size in bytes
str type_name = typeof(variable);       // "i32", "Vector3", etc.

// Usage in generic functions
generic<T> void = print_type_info(T value) {
    printf("Type: {}, Size: {} bytes\n", typeof(value), sizeof(T));
}
```

### Assertion and Debugging

```cesium
// Runtime assertions
void = validate_input(i32 value) {
    assert(value >= 0);  // program terminates if false
    assert(value < MAX_VALUE, "Value too large: {}", value);
}

// Compile-time assertions
comptime {
    assert(sizeof(i32) == 4);  // verified at compile time
}
```

## Inline Assembly

### Basic Assembly Blocks

```cesium
// Raw assembly with Intel syntax
volatile u64 timestamp;
asm {
    rdtsc
    shl rdx, 32
    or rax, rdx
    mov timestamp, rax
}

// SIMD assembly operations
simd f32 a[4], b[4], result[4];
asm {
    vmovups xmm0, a
    vmovups xmm1, b
    vaddps xmm0, xmm0, xmm1
    vmovups result, xmm0
}
```

### Performance-Critical Operations

```cesium
// Custom memory operations
void = fast_memcpy(#void dest, #void src, uword count) {
    asm {
        mov rdi, dest
        mov rsi, src
        mov rcx, count
        rep movsb
    }
}

// Hardware-specific optimizations
f64 = fast_sqrt(f64 value) {
    f64 result;
    asm {
        sqrtsd xmm0, value
        movsd result, xmm0
    }
    return result;
}
```

## Grammar Reference

### Lexical Grammar

```cesium
// Tokens
IDENTIFIER := [a-zA-Z_][a-zA-Z0-9_]*
INTEGER := [0-9]+ | 0x[0-9a-fA-F]+ | 0b[01]+
FLOAT := [0-9]*\.[0-9]+([eE][+-]?[0-9]+)?
STRING := "([^"\\]|\\.)*"
INTERPOLATED_STRING := `([^`{\\]|\\.|{[^}]*})*`

// Comments
LINE_COMMENT := //[^\n]*
BLOCK_COMMENT := /\*([^*]|\*[^/])*\*/
DOC_COMMENT := ///[^\n]*
```

### Syntax Grammar (EBNF)

```ebnf
program := (declaration | import_statement)*

declaration := function_declaration
             | struct_declaration
             | enum_declaration
             | error_declaration
             | trait_declaration
             | impl_declaration
             | variable_declaration
             | alias_declaration

function_declaration := qualifier* return_type "=" IDENTIFIER generic_params?
                       "(" parameter_list? ")" "{" statement* "}"

struct_declaration := "struct" IDENTIFIER inheritance? "{" struct_member* "}"

inheritance := "(" type_list ")"

type_list := type ("," type)*

statement := expression_statement
           | control_statement
           | declaration
           | block_statement

expression := assignment_expression

assignment_expression := ownership_expression (("=" | ":=") ownership_expression)*

ownership_expression := logical_or_expression

// ... (additional grammar rules)
```

### Type System Grammar

```ebnf
type := primitive_type
      | array_type
      | pointer_type
      | function_type
      | generic_type
      | qualified_type

primitive_type := "u8" | "u16" | "u32" | "u64" | "uword"
                | "i8" | "i16" | "i32" | "i64"
                | "f32" | "f64"
                | "void" | "str" | "path"

array_type := type "[" expression? "]"

pointer_type := "#" type

qualified_type := qualifier+ type

qualifier := "const" | "static" | "private" | "secret"
           | "volatile" | "atomic" | "register" | "simd"
```

## Compilation Model

### Build Process

1. **Lexical Analysis**: Source code tokenization
2. **Parsing**: Abstract syntax tree generation with error recovery
3. **Semantic Analysis**: Type checking, borrow checking, trait resolution
4. **Generic Instantiation**: Monomorphization of generic functions and types
5. **Optimization**: Dead code elimination, inlining, constant propagation
6. **Code Generation**: Translation to LLVM intermediate representation
7. **Backend Compilation**: LLVM compilation to native machine code

### Compilation Targets

- **Primary Backend**: LLVM compiler infrastructure
- **Output Formats**: Native executables, static libraries, dynamic libraries
- **Platform Support**: x86-64, ARM64, with extensibility for additional architectures
- **ABI Compatibility**: C calling conventions and data layout

### Compile-Time Features

```cesium
// Compile-time code execution
comptime {
    const BUILD_VERSION = get_git_commit();
    const OPTIMIZATION_LEVEL = 3;

    if (target_arch == "x86_64") {
        enable_sse_optimizations();
    }
}

// Conditional compilation
comptime {
    if (debug_mode) {
        add_bounds_checking();
        enable_memory_tracking();
    }
}

// Generic specialization
generic<T> void = print_value(T value) {
    comptime {
        if (typeof(T) == "f64" || typeof(T) == "f32") {
            printf("{:.6f}\n", value);
        } else {
            printf("{}\n", value);
        }
    }
}
```

### Error Messages and Diagnostics

```cesium
// Compile-time error examples:

// Type mismatch
i32 x = 3.14;  // Error: Cannot assign f64 to i32, use explicit conversion

// Ownership violation
Matrix m := create_matrix();
Matrix copy = m;  // Error: Cannot copy owned value, use move() or borrow

// Borrow checker violation
~Matrix writer = ~m;
#Matrix reader = #m;  // Error: Cannot create immutable borrow while mutable borrow exists

// Use after move
Matrix a := create_matrix();
Matrix b := move(a);
f64 det = determinant(#a);  // Error: Use of moved value 'a'
```

## Standard Library Organization

### Standard Library Modules

```cesium
// Core modules (automatically available)
std.builtin    // Built-in functions when shadowed
std.memory     // Advanced memory management (allocators, arenas)
std.math       // Extended mathematical functions
std.string     // String manipulation utilities
std.collections // Advanced container types
std.io         // File and stream I/O
std.os         // Operating system interfaces
std.thread     // Concurrency primitives
std.simd       // SIMD intrinsics and utilities
```

### Example Standard Library Usage

```cesium
// Using standard library containers
import(std.collections) { HashMap; ArrayList }

HashMap[str, i32] word_count;
ArrayList[str] lines;

// Advanced memory management
import(std.memory) { ArenaAllocator; PoolAllocator }

ArenaAllocator arena;
#f64 temp_data = arena.alloc(1000);
// arena automatically frees all allocations when destroyed

// Extended math functions
import(std.math) { pow; log; exp }

f64 result = pow(base, exponent);
f64 natural_log = log(value);
```

## File Extensions and Project Structure

### File Extensions

- **Source files**: `.cesium` or `.cs`
- **Module interface files**: `.m`
- **Generated C headers**: `.h` (via `--generate-headers` compiler flag)

### Project Structure Example

```text
project/
├── src/
│   ├── main.cesium           # Main entry point
│   ├── math/
│   │   ├── vector.cesium     # Vector implementation
│   │   ├── matrix.cesium     # Matrix implementation
│   │   └── quaternion.cesium # Quaternion implementation
│   └── graphics/
│       ├── renderer.cesium   # Rendering engine
│       └── primitives.cesium # Basic shapes
├── include/
│   ├── math.m               # Math module interface
│   └── graphics.m           # Graphics module interface
├── build/
│   ├── debug/               # Debug build artifacts
│   └── release/             # Release build artifacts
└── cesium.toml              # Project configuration
```

### Build Configuration

```toml
# cesium.toml
[project]
name = "math_engine"
version = "1.0.0"
authors = ["Developer Name"]

[build]
target = "native"
optimization = "fast"
debug_info = true

[dependencies]
blas = { version = "3.8", system = true }
opengl = { version = "4.6", system = true }

[features]
simd = true
parallel = true
```

## Performance Considerations

### Memory Layout and Alignment

```cesium
// Explicit memory layout control
struct AlignedData {
    f64 values[4] align(32);  // 32-byte alignment for SIMD
    u8 flags[16] pack(1);     // Pack without padding
}

// Cache-friendly data structures
struct Matrix {
    simd f64 data[64] align(64);  // Align to cache line
    uword rows, cols;
}
```

### Optimization Hints

```cesium
// Loop optimization hints
for (uword i = 0..size) {
    comptime unroll(4);  // Unroll loop by factor of 4
    result[i] = data[i] * scale;
}

// Function inlining
inline f64 = fast_multiply(f64 a, f64 b) {
    return a * b;
}

// Branch prediction hints
if likely(common_condition) {
    handle_common_case();
} else {
    handle_rare_case();
}
```

## Conclusion

Cesium provides a modern, performance-oriented programming language specifically designed for mathematical computing while maintaining systems programming capabilities. The language emphasizes:

- **Explicit control** over memory management and performance characteristics
- **Mathematical expressiveness** through context-aware operators and built-in mathematical types
- **Memory safety** through ownership tracking and compile-time borrow checking
- **Interoperability** with existing C libraries and systems
- **Predictable performance** through static dispatch and ahead-of-time compilation

The language strikes a balance between safety and performance, providing developers with the tools needed for both rapid mathematical prototyping and production systems development.
