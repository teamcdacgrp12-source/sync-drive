package com.syncdrive.auth.security.services;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.syncdrive.auth.entity.Users;

public class UserDetailsImplementation implements UserDetails {
	private static final long serialVersionUID = 1L;
	private final Long id;
	private final String username;
	private final String password;
	private final String email;

	public UserDetailsImplementation(Long id, String username, String password, String email) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.email = email;
	}

	public static UserDetailsImplementation build(Users user) {
		return new UserDetailsImplementation(user.getId(), user.getUsername(), user.getPassword(), user.getEmail());
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of();
	}

	public Long getId() { return id; }
	public String getEmail() { return email; }
	@Override public String getPassword() { return password; }
	@Override public String getUsername() { return username; }
	@Override public boolean isAccountNonExpired() { return true; }
	@Override public boolean isAccountNonLocked() { return true; }
	@Override public boolean isCredentialsNonExpired() { return true; }
	@Override public boolean isEnabled() { return true; }
}
