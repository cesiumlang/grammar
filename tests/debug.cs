// SYNTAX TEST "source.cesium" "Debug single char"

// Test standalone identifiers (no assertions - just for debugging)
a
ab
abc

// Test identifiers in context (should work)
i32 testvar = 5;
//  ^^^^^^^ variable.other.cesium

// Test function call (should work)
printf("test");
//^^^^ support.function.builtin.cesium