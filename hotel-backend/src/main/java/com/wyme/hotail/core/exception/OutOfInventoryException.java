package com.wyme.hotail.core.exception;

public class OutOfInventoryException extends RuntimeException {
    public OutOfInventoryException(String message) {
        super(message);
    }
}
