package com.syncdrive.room.dto;

public class JoinRoomResponseDTO {

    private Long roomId;
    private String roomName;
    private int currentParticipants;

    public JoinRoomResponseDTO(Long roomId, String roomName, int currentParticipants) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.currentParticipants = currentParticipants;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public int getCurrentParticipants() {
        return currentParticipants;
    }
}
