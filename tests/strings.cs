// SYNTAX TEST "source.cesium" "String Tests"

// Test string literals
str message = "Hello, world!";
//            ^^^^^^^^^^^^^^^ string.quoted.double.cesium

// Test escape sequences
str escaped = "Line 1\nLine 2";
//            ^^^^^^^^^^^^^^^^ string.quoted.double.cesium

// Test interpolated strings
str name = "Alice";
str greeting = `Hello, {name}!`;
//             ^ string.interpolated.cesium
//                     ^ meta.embedded.line.cesium
//                           ^ string.interpolated.cesium

// Test character literals
char letter = 'A';
//            ^^^ constant.character.cesium

// Test path strings
path config = path("config.ini");
//            ^^^^ storage.type.builtin.cesium
//                 ^^^^^^^^^^ string.quoted.double.cesium