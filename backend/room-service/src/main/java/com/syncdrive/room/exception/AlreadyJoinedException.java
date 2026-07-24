package com.syncdrive.room.exception;

public class AlreadyJoinedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AlreadyJoinedException(String message) {
        super(message);
    }
}
