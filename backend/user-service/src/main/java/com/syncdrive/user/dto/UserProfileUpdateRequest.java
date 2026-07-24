package com.syncdrive.user.dto;

public class UserProfileUpdateRequest {
	private String displayName;
	private String avatarUrl;

	public UserProfileUpdateRequest() { }
	public UserProfileUpdateRequest(String displayName, String avatarUrl) {
		this.displayName = displayName;
		this.avatarUrl = avatarUrl;
	}
	public String getDisplayName() { return displayName; }
	public void setDisplayName(String displayName) { this.displayName = displayName; }
	public String getAvatarUrl() { return avatarUrl; }
	public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
