package com.syncdrive.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class JoinRoomRequestDTO {

    @NotBlank(message = "Room code is required")
    @Pattern(regexp = "^[A-Z0-9]{6,20}$", message = "Invalid room code format")
    private String roomCode;

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }
}
