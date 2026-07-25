package com.syncdrive.room.service;

import java.util.List;

import com.syncdrive.room.dto.CreateRoomRequestDTO;
import com.syncdrive.room.dto.CreateRoomResponseDTO;
import com.syncdrive.room.dto.RoomListResponseDTO;

public interface RoomService {

    CreateRoomResponseDTO createRoom(CreateRoomRequestDTO request, Long hostUserId);

    void joinRoom(String roomCode, Long userId);

    void leaveRoom(String roomCode, Long userId);

    Long getHostIdByRoomId(Long roomId);

    List<RoomListResponseDTO> getPublicRooms();

    RoomListResponseDTO getRoomDetails(String roomCode);
}
