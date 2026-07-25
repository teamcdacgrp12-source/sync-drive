package com.syncdrive.room.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.syncdrive.room.dto.CreateRoomRequestDTO;
import com.syncdrive.room.dto.CreateRoomResponseDTO;
import com.syncdrive.room.dto.RoomListResponseDTO;
import com.syncdrive.room.service.RoomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<CreateRoomResponseDTO> createRoom(
            @Valid @RequestBody CreateRoomRequestDTO request,
            @RequestHeader("X-USER-ID") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request, userId));
    }

    @PostMapping("/join/{roomCode}")
    public ResponseEntity<Void> joinRoom(
            @PathVariable String roomCode,
            @RequestHeader("X-USER-ID") Long userId) {
        roomService.joinRoom(roomCode, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomCode}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String roomCode,
            @RequestHeader("X-USER-ID") Long userId) {
        roomService.leaveRoom(roomCode, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public")
    public ResponseEntity<List<RoomListResponseDTO>> getPublicRooms() {
        return ResponseEntity.ok(roomService.getPublicRooms());
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomListResponseDTO> getRoomDetails(@PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoomDetails(roomCode));
    }

    @GetMapping("/{roomId}/host")
    public ResponseEntity<Long> getHostId(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getHostIdByRoomId(roomId));
    }
}
