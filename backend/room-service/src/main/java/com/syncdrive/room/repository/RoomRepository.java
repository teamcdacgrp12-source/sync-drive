package com.syncdrive.room.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.syncdrive.room.entity.Room;

import jakarta.persistence.LockModeType;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String roomCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.roomCode = :roomCode")
    Optional<Room> findByRoomCodeWithLock(@Param("roomCode") String roomCode);

    boolean existsByIdAndHostUserId(Long roomId, Long hostUserId);

    @Query("SELECT r FROM Room r WHERE r.isPublic = true")
    List<Room> findPublicRooms();
}
