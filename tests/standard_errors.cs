// SYNTAX TEST "source.cesium" "Standard Error Types Tests"

// Test built-in/standard error types in variable declarations
FileNotFound fileErr;
//^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

AccessDenied accessErr;
//^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

NetworkTimeout timeoutErr;
//^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

NoImpl notImplemented;
//^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

PermissionDenied permErr;
//^^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

InvalidArgument argErr;
//^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

OutOfMemory memErr;
//^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

Timeout generalTimeout;
//^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

NotImplemented featureErr;
//^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium variable.other.cesium

// Test standard error types in catch blocks
result catch (err) {
//     ^^^^^ keyword.control.cesium
    case (FileNotFound) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("File not found\n");
    }
    case (AccessDenied) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Access denied\n");
    }
    case (NoImpl) {
//  ^^^^ keyword.control.cesium
//        ^^^^^ invalid.errorstruct.builtin.cesium
        printf("Not implemented\n");
    }
    case (OutOfMemory|InvalidArgument) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
//                   ^ keyword.operator.bitwise.cesium
//                    ^^^^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("System error\n");
    }
}

// Test custom error types still work
CustomError customErr;
//^^^^^^^^^ invalid.errorstruct.cesium

MySpecialFailure failureErr;
//^^^^^^^^^^^^^^ invalid.errorstruct.cesium