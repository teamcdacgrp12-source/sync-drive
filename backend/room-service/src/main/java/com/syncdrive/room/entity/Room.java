package com.syncdrive.room.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "rooms", uniqueConstraints = @UniqueConstraint(columnNames = "room_code"))
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", nullable = false, length = 20)
    private String roomCode;

    @Column(name = "host_user_id", nullable = false)
    private Long hostUserId;

    @Column(name = "room_name")
    private String roomName;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    protected Room() { }

    public Room(String roomCode, Long hostUserId, String roomName) {
        this.roomCode = roomCode;
        this.hostUserId = hostUserId;
        this.roomName = roomName;
        this.active = true;
    }

    public Room(String roomCode, Long hostUserId, String roomName, boolean isPublic, Integer maxUsers) {
        this.roomCode = roomCode;
        this.hostUserId = hostUserId;
        this.roomName = roomName;
        this.isPublic = isPublic;
        this.maxUsers = maxUsers;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getRoomCode() { return roomCode; }
    public Long getHostUserId() { return hostUserId; }
    public String getRoomName() { return roomName; }
    public boolean isActive() { return active; }
    public boolean isPublic() { return isPublic; }
    public Integer getMaxUsers() { return maxUsers; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    public void setMaxUsers(Integer maxUsers) { this.maxUsers = maxUsers; }
    public void closeRoom() { this.active = false; }
}
