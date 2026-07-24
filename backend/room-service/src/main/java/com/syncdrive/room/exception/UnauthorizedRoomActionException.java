package com.syncdrive.room.exception;

public class UnauthorizedRoomActionException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public UnauthorizedRoomActionException(String message) {
        super(message);
    }
}
