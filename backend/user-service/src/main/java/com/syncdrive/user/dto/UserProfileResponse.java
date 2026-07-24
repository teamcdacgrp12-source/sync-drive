package com.syncdrive.user.dto;

public class UserProfileResponse {
	private Long userId;
	private String username;
	private String displayName;
	private String avatarUrl;

	public UserProfileResponse() { }
	public UserProfileResponse(Long userId, String username, String displayName, String avatarUrl) {
		this.userId = userId;
		this.username = username;
		this.displayName = displayName;
		this.avatarUrl = avatarUrl;
	}
	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getDisplayName() { return displayName; }
	public void setDisplayName(String displayName) { this.displayName = displayName; }
	public String getAvatarUrl() { return avatarUrl; }
	public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
