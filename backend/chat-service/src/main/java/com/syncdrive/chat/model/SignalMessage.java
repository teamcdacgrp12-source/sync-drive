package com.syncdrive.chat.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class SignalMessage {
    private String roomId;
    @JsonProperty("sender")
    private String senderId;
    private String targetUserId;
    private String type;
    private String payload;
    private Instant timestamp;

    public SignalMessage() {
        this.timestamp = Instant.now();
    }

    public SignalMessage(String roomId, String senderId, String targetUserId, String type, String payload) {
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

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
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

}
