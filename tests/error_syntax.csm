// SYNTAX TEST "source.cesium" "Error Syntax Tests"

// Test error struct definitions
error FileNotFound {
//    ^^^^^^^^^^^^ invalid.errorstruct.cesium
    str path;
    i32 errno;
}

error AccessDenied {
//    ^^^^^^^^^^^^ invalid.errorstruct.cesium
    str message;
    i32 permission_level;
}

error NetworkTimeout {
//    ^^^^^^^^^^^^^^ invalid.errorstruct.cesium
    str host;
    i32 timeout_ms;
}

// Test error type aliases
alias FileError = FileNotFound|AccessDenied;
//    ^^^^^^^^^ invalid.errorstruct.cesium
//                ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
//                            ^ keyword.operator.bitwise.cesium
//                             ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium

alias IOError = FileError|NetworkTimeout;
//    ^^^^^^^ invalid.errorstruct.cesium
//              ^^^^^^^^^ invalid.errorstruct.cesium
//                       ^ keyword.operator.bitwise.cesium
//                        ^^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium

alias SystemFailure = FileError;
//    ^^^^^^^^^^^^^ invalid.errorstruct.cesium
//                    ^^^^^^^^^ invalid.errorstruct.cesium

// Test union declarations (new syntax)
union FileError = FileNotFound|AccessDenied;
//    ^^^^^^^^^ invalid.errorstruct.cesium
//                ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
//                            ^ keyword.operator.bitwise.cesium
//                             ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium

union IOError = FileError|NetworkTimeout;
//    ^^^^^^^ invalid.errorstruct.cesium
//              ^^^^^^^^^ invalid.errorstruct.cesium
//                       ^ keyword.operator.bitwise.cesium
//                        ^^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium

// Test non-error unions
union Number = i32|f64|u64;
//    ^^^^^^ entity.name.type.cesium

union Shape = Circle|Rectangle|Triangle;
//    ^^^^^ entity.name.type.cesium

// Test function with error return types
FileError|file = open_file(str path) {
//^^^^^^^ invalid.errorstruct.cesium
//       ^ keyword.operator.bitwise.cesium
//        ^^^^ entity.name.type.cesium
//             ^ keyword.operator.assignment.cesium
//               ^^^^^^^^^ entity.name.function.cesium
    if (!file_exists(path)) {
//       ^^^^^^^^^^^ entity.name.function.call.cesium
        return FileNotFound { path = path, errno = 2 };
//             ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
    }
    return FileFound { path = path };
//         ^^^^^^^^^ entity.name.type.cesium
}

// Test regular function for comparison (should NOT be error types)
MyData result = process_data(str input) {
//^^^^ entity.name.type.cesium
//     ^^^^^^ variable.other.cesium
//            ^ keyword.operator.assignment.cesium
//              ^^^^^^^^^^^^ entity.name.function.call.cesium
    return MyData { value = input };
//         ^^^^^^ entity.name.type.cesium
}

// Test error types in variable declarations
FileAccessError fileErr;
//^^^^^^^^^^^^^ invalid.errorstruct.cesium
//              ^^^^^^^ variable.other.cesium

ParseError parseErr = createParseError();
//^^^^^^^^ invalid.errorstruct.cesium
//         ^^^^^^^^ variable.other.cesium
//                  ^ keyword.operator.assignment.cesium
//                    ^^^^^^^^^^^^^^^^ entity.name.function.call.cesium

// Test catch blocks with error type pattern matching
file_or_error catch (err) {
//            ^^^^^ keyword.control.cesium
    case (FileNotFound) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("File not found\n");
    }
    case (AccessDenied) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Access denied\n");
    }
    case (FileNotFound|AccessDenied) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
//                    ^ keyword.operator.bitwise.cesium
//                     ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("File access error\n");
    }
    case (NetworkTimeout) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Network timeout\n");
    }
}