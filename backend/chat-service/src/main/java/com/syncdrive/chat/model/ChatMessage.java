package com.syncdrive.chat.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class ChatMessage {
    private String roomId;
    @JsonProperty("sender")
    private String senderId;
    private Long userId;
    private String senderName;
    private String content;
    private MessageType type;
    private Instant timestamp;

    public ChatMessage() {
        this.timestamp = Instant.now();
        this.type = MessageType.CHAT;
    }

    public ChatMessage(String roomId, String senderId, String senderName, String content, MessageType type) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.type = type;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        SYSTEM,
        HOST_LEFT,
        SYNC
    }
}
