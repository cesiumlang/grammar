// SYNTAX TEST "source.cesium" "Number Tests"

// Test integer literals
i32 decimal = 42;
//            ^^ constant.numeric.integer.cesium

// Test hex numbers
u32 hex_value = 0xFF00;
//              ^^^^^^ constant.numeric.integer.hex.cesium

// Test binary numbers
u8 binary = 0b10101010;
//          ^^^^^^^^^^ constant.numeric.integer.binary.cesium

// Test octal numbers
u16 octal = 0o755;
//          ^^^^^ constant.numeric.integer.octal.cesium

// Test float literals
f32 pi = 3.14159;
//       ^^^^^^^ constant.numeric.float.cesium

f64 scientific = 1.23e-4;
//               ^^^^^^^ constant.numeric.float.cesium