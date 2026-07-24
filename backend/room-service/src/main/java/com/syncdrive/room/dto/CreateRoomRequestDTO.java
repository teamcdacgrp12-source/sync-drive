package com.syncdrive.room.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateRoomRequestDTO {

    @NotBlank(message = "Room name must not be blank")
    @Size(min = 3, max = 100, message = "Room name must be between 3 and 100 characters")
    private String roomName;

    @NotNull(message = "Room visibility must be specified")
    private Boolean isPublic;

    @Min(value = 2, message = "Room must allow at least 2 participants")
    @Max(value = 100, message = "Room cannot exceed 100 participants")
    private Integer maxUsers;

    public CreateRoomRequestDTO() {
    }

    public CreateRoomRequestDTO(String roomName, Boolean isPublic, Integer maxUsers) {
        this.roomName = roomName;
        this.isPublic = isPublic;
        this.maxUsers = maxUsers;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }
}
