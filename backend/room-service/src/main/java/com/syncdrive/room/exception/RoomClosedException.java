package com.syncdrive.room.exception;

public class RoomClosedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RoomClosedException(String message) {
        super(message);
    }
}
