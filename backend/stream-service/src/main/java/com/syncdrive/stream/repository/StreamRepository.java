package com.syncdrive.stream.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.syncdrive.stream.domain.Stream;

public interface StreamRepository extends JpaRepository<Stream, Long> {
	Optional<Stream> findByRoomId(Long roomId);
}
