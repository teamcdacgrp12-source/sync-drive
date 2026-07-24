package com.syncdrive.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.syncdrive.user.dto.UserProfileResponse;
import com.syncdrive.user.dto.UserProfileUpdateRequest;
import com.syncdrive.user.entity.UserProfile;
import com.syncdrive.user.repository.UserProfileRepository;

@Service
public class UserProfileService {

	private final UserProfileRepository userProfileRepository;

	public UserProfileService(UserProfileRepository userProfileRepository) {
		this.userProfileRepository = userProfileRepository;
	}

	public UserProfileResponse getProfileByUserId(long userId) {
		return mapToResponse(userProfileRepository.findByUserId(userId)
				.orElseThrow(() -> new RuntimeException("User profile not found for ID: " + userId)));
	}

	public List<UserProfileResponse> getBatchProfiles(List<Long> userIds) {
		return userProfileRepository.findByUserIdIn(userIds).stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Transactional
	public UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
		UserProfile profile = userProfileRepository.findByUserId(userId)
				.orElseThrow(() -> new RuntimeException("User profile not found for ID: " + userId));
		if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
			profile.setDisplayName(request.getDisplayName());
		}
		if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
			profile.setAvatarUrl(request.getAvatarUrl());
		}
		return mapToResponse(userProfileRepository.save(profile));
	}

	@Transactional
	public UserProfileResponse createInitialProfile(Long userId, String username) {
		if (userProfileRepository.findByUserId(userId).isPresent()) {
			throw new RuntimeException("Profile already exists for user " + userId);
		}
		UserProfile profile = new UserProfile();
		profile.setUserId(userId);
		profile.setUsername(username);
		profile.setDisplayName(username);
		return mapToResponse(userProfileRepository.save(profile));
	}

	private UserProfileResponse mapToResponse(UserProfile profile) {
		if (profile == null) return null;
		return new UserProfileResponse(profile.getUserId(), profile.getUsername(), profile.getDisplayName(), profile.getAvatarUrl());
	}
}
