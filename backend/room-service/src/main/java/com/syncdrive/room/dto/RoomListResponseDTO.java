package com.syncdrive.room.dto;

public class RoomListResponseDTO {

    private Long roomId;
    private String roomCode;
    private String roomName;
    private Long hostUserId;
    private int participantCount;
    private boolean isPublic;
    private Integer maxUsers;

    public RoomListResponseDTO(Long roomId, String roomCode, String roomName, Long hostUserId, int participantCount,
            boolean isPublic, Integer maxUsers) {
        this.roomId = roomId;
        this.roomCode = roomCode;
        this.roomName = roomName;
        this.hostUserId = hostUserId;
        this.participantCount = participantCount;
        this.isPublic = isPublic;
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

    public Long getHostUserId() {
        return hostUserId;
    }

    public int getParticipantCount() {
        return participantCount;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }
}
