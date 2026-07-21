package com.syncdrive.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.syncdrive.auth.entity.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {

	Users findByUsername(String username);
	Boolean existsByUsername(String username);
	Boolean existsByEmail(String email);
}
