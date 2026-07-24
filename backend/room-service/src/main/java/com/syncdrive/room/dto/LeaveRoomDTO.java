package com.syncdrive.room.dto;

import jakarta.validation.constraints.NotNull;

public class LeaveRoomDTO {

    @NotNull(message = "Room ID is required")
    private Long roomId;

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
}
