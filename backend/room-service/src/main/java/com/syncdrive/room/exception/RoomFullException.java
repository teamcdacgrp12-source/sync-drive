package com.syncdrive.room.exception;

public class RoomFullException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RoomFullException(String message) {
        super(message);
    }
}
