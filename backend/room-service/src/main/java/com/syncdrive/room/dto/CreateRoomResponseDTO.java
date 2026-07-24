package com.syncdrive.room.dto;

public class CreateRoomResponseDTO {

    private Long roomId;
    private String roomCode;
    private String roomName;
    private boolean isPublic;
    private boolean active;
    private Integer maxUsers;

    public CreateRoomResponseDTO(Long roomId, String roomCode, String roomName, boolean isPublic, boolean active,
            Integer maxUsers) {
        this.roomId = roomId;
        this.roomCode = roomCode;
        this.roomName = roomName;
        this.isPublic = isPublic;
        this.active = active;
        this.maxUsers = maxUsers;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public String getRoomName() {
        return roomName;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public boolean isActive() {
        return active;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }
}
