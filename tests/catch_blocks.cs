// SYNTAX TEST "source.cesium" "Catch Block Tests"

// Test basic catch with pattern matching
file_or_error catch (err) {
//            ^^^^^ keyword.control.cesium
    case (FileNotFound) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("File not found: {}\n", err.path);
    }
    case (AccessDenied) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Access denied: {}\n", err.message);
    }
}

// Test multiple error types in single case
batch_result catch (err) {
//           ^^^^^ keyword.control.cesium
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
        printf("Network timeout: {}\n", err.host);
    }
    case (ParseError|ValidationError) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^ invalid.errorstruct.cesium
//                  ^ keyword.operator.bitwise.cesium
//                   ^^^^^^^^^^^^^^^ invalid.errorstruct.cesium
        printf("Data processing error\n");
    }
    else {
        printf("Unknown error\n");
    }
}

// Test catch with resource management
with f = file("data.txt", "r") {
    data = read_all(f);
} catch (err) {
//^^^^^ keyword.control.cesium
    case (FileNotFound) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Input file missing\n");
    }
    case (AccessDenied) {
//  ^^^^ keyword.control.cesium
//        ^^^^^^^^^^^^ invalid.errorstruct.builtin.cesium
        printf("Cannot read file\n");
    }
}