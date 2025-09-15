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
//                ^^^^^^^^^^^^ entity.name.type.cesium
//                            ^ keyword.operator.bitwise.cesium
//                             ^^^^^^^^^^^^ entity.name.type.cesium

alias IOError = FileError|NetworkTimeout;
//    ^^^^^^^ invalid.errorstruct.cesium
//              ^^^^^^^^^ invalid.errorstruct.cesium
//                       ^ keyword.operator.bitwise.cesium
//                        ^^^^^^^^^^^^^^ entity.name.type.cesium

alias SystemFailure = FileError;
//    ^^^^^^^^^^^^^ invalid.errorstruct.cesium
//                    ^^^^^^^^^ invalid.errorstruct.cesium

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
//             ^^^^^^^^^^^^ entity.name.type.cesium
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