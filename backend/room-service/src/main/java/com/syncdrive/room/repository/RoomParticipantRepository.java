package com.syncdrive.room.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.syncdrive.room.entity.RoomParticipant;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    void deleteByRoomIdAndUserId(Long roomId, Long userId);

    long countByRoomId(Long roomId);

    List<RoomParticipant> findByRoomId(Long roomId);
}
