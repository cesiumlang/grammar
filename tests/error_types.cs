// SYNTAX TEST "source.cesium" "Error Type Tests"

// Test error struct types in various contexts
FileNotFoundError myError;
NetworkTimeoutError timeout;
MyClass normalType;
PersonData userData;

void handleError(FileSystemError fsErr) {
    return;
}

if (result instanceof FileAccessError) {
    // handle error
}

ParseError err = createParseError();