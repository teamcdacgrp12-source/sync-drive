package com.syncdrive.user.controller;

import java.util.List;
import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.syncdrive.user.dto.UserProfileResponse;
import com.syncdrive.user.dto.UserProfileUpdateRequest;
import com.syncdrive.user.service.UserProfileService;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

	private final UserProfileService userProfileService;

	public UserProfileController(UserProfileService userProfileService) {
		this.userProfileService = userProfileService;
	}

	@GetMapping("/{userId:\\d+}")
	public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
		return ResponseEntity.ok(userProfileService.getProfileByUserId(userId));
	}

	@PutMapping("/me")
	public ResponseEntity<UserProfileResponse> updateMyProfile(@RequestHeader("X-User-Id") Long userId,
			@RequestBody UserProfileUpdateRequest request) {
		return ResponseEntity.ok(userProfileService.updateProfile(userId, request));
	}

	@PostMapping("/batch")
	public ResponseEntity<List<UserProfileResponse>> getUsersBatch(@RequestBody List<Long> userIds) {
		return ResponseEntity.ok(userProfileService.getBatchProfiles(userIds));
	}

	@PostMapping("/internal/create")
	public ResponseEntity<UserProfileResponse> createProfile(@RequestParam Long userId, @RequestParam String username) {
		return ResponseEntity.ok(userProfileService.createInitialProfile(userId, username));
	}

	@PostMapping("/upload-avatar")
	public ResponseEntity<UserProfileResponse> uploadAvatar(@RequestHeader("X-User-Id") Long userId,
			@RequestParam("file") MultipartFile file) {
		try {
			return ResponseEntity.ok(userProfileService.uploadAvatar(userId, file));
		} catch (IOException exception) {
			return ResponseEntity.internalServerError().build();
		}
	}

	@GetMapping("/uploads/{filename:.+}")
	public ResponseEntity<org.springframework.core.io.Resource> getAvatar(@PathVariable String filename) {
		try {
			java.nio.file.Path serviceDirectory = java.nio.file.Paths.get(System.getProperty("user.dir"));
			java.nio.file.Path sharedPath = serviceDirectory.getParent().resolve("uploads").resolve(filename);
			java.nio.file.Path localPath = serviceDirectory.resolve("uploads").resolve(filename);
			java.nio.file.Path path = java.nio.file.Files.exists(sharedPath) ? sharedPath : localPath;
			if (!java.nio.file.Files.exists(path)) {
				return ResponseEntity.notFound().build();
			}
			org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
			return resource.isReadable()
					? ResponseEntity.ok().header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg").body(resource)
					: ResponseEntity.notFound().build();
		} catch (Exception exception) {
			return ResponseEntity.internalServerError().build();
		}
	}
}
