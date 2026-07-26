package com.syncdrive.chat.model;

import java.time.Instant;

public class SignalMessage {
    private String roomId;
    private Long senderId;
    private Long targetUserId;
    private SignalType type;
    private String payload;
    private Instant timestamp;

    public SignalMessage() {
        this.timestamp = Instant.now();
    }

    public SignalMessage(String roomId, Long senderId, Long targetUserId, SignalType type, String payload) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.targetUserId = targetUserId;
        this.type = type;
        this.payload = payload;
        this.timestamp = Instant.now();
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public SignalType getType() {
        return type;
    }

    public void setType(SignalType type) {
        this.type = type;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public enum SignalType {
        OFFER,
        ANSWER,
        ICE_CANDIDATE,
        MEDIA_STATE
    }
}
