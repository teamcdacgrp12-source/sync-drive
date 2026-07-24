package com.syncdrive.room.exception;

public class InvalidRoomCodeException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InvalidRoomCodeException(String message) {
        super(message);
    }
}
