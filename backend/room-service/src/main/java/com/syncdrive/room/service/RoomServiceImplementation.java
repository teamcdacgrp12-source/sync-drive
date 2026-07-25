package com.syncdrive.room.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.syncdrive.room.dto.CreateRoomRequestDTO;
import com.syncdrive.room.dto.CreateRoomResponseDTO;
import com.syncdrive.room.dto.RoomListResponseDTO;
import com.syncdrive.room.entity.Room;
import com.syncdrive.room.entity.RoomParticipant;
import com.syncdrive.room.exception.InvalidRoomCodeException;
import com.syncdrive.room.exception.RoomFullException;
import com.syncdrive.room.exception.RoomNotFoundException;
import com.syncdrive.room.repository.RoomParticipantRepository;
import com.syncdrive.room.repository.RoomRepository;

import jakarta.transaction.Transactional;

@Service
public class RoomServiceImplementation implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomParticipantRepository roomParticipantRepository;

    public RoomServiceImplementation(RoomRepository roomRepository,
            RoomParticipantRepository roomParticipantRepository) {
        this.roomRepository = roomRepository;
        this.roomParticipantRepository = roomParticipantRepository;
    }

    @Override
    @Transactional
    public CreateRoomResponseDTO createRoom(CreateRoomRequestDTO request, Long hostUserId) {
        String roomCode = generateRoomCode();
        Room room = new Room(roomCode, hostUserId, request.getRoomName(), request.getIsPublic(), request.getMaxUsers());
        Room savedRoom = roomRepository.save(room);

        roomParticipantRepository.save(new RoomParticipant(savedRoom.getId(), hostUserId));

        return new CreateRoomResponseDTO(
                savedRoom.getId(),
                savedRoom.getRoomCode(),
                savedRoom.getRoomName(),
                savedRoom.isPublic(),
                savedRoom.isActive(),
                savedRoom.getMaxUsers());
    }

    @Override
    @Transactional
    public void joinRoom(String roomCode, Long userId) {
        if (roomCode == null || roomCode.isBlank()) {
            throw new InvalidRoomCodeException("Room code cannot be empty");
        }

        Room room = roomRepository.findByRoomCodeWithLock(roomCode)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with code: " + roomCode));

        if (!room.isActive()) {
            throw new RoomNotFoundException("Room is no longer active");
        }

        if (roomParticipantRepository.existsByRoomIdAndUserId(room.getId(), userId)) {
            return;
        }

        long currentParticipants = roomParticipantRepository.countByRoomId(room.getId());
        if (room.getMaxUsers() != null && currentParticipants >= room.getMaxUsers()) {
            throw new RoomFullException("Room is full. Max users: " + room.getMaxUsers());
        }

        roomParticipantRepository.save(new RoomParticipant(room.getId(), userId));
    }

    @Override
    @Transactional
    public void leaveRoom(String roomCode, Long userId) {
        Room room = roomRepository.findByRoomCodeWithLock(roomCode)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with code: " + roomCode));

        Long roomId = room.getId();
        if (!roomParticipantRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new IllegalStateException("User is not a participant of this room");
        }

        if (room.getHostUserId().equals(userId)) {
            roomRepository.deleteById(roomId);
            return;
        }

        roomParticipantRepository.deleteByRoomIdAndUserId(roomId, userId);

        if (roomParticipantRepository.countByRoomId(roomId) == 0) {
            roomRepository.deleteById(roomId);
        }
    }

    @Override
    public Long getHostIdByRoomId(Long roomId) {
        return roomRepository.findById(roomId)
                .map(Room::getHostUserId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with ID: " + roomId));
    }

    @Override
    public List<RoomListResponseDTO> getPublicRooms() {
        return roomRepository.findPublicRooms()
                .stream()
                .map(this::toRoomListResponse)
                .toList();
    }

    @Override
    public RoomListResponseDTO getRoomDetails(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RoomNotFoundException("Room not found with code: " + roomCode));

        return toRoomListResponse(room);
    }

    private RoomListResponseDTO toRoomListResponse(Room room) {
        long participantCount = roomParticipantRepository.countByRoomId(room.getId());
        return new RoomListResponseDTO(
                room.getId(),
                room.getRoomCode(),
                room.getRoomName(),
                room.getHostUserId(),
                (int) participantCount,
                room.isPublic(),
                room.getMaxUsers());
    }

    private String generateRoomCode() {
        String code;
        do {
            code = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase();
        } while (roomRepository.findByRoomCode(code).isPresent());

        return code;
    }
}
