package com.syncdrive.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name="users")
public class Users {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(nullable = false, unique = true)
	@NotBlank
	private String username;

	@Column(name = "password_hash", nullable = false)
	@NotBlank
	private String password;

	@Column(nullable = false, unique = true, length = 100)
	@NotBlank
	private String email;

	@Column(name = "auth_provider")
	private String provider;

	public Users() {

	}

	public Users(String username, String password, String email) {

		this.username = username;
		this.password = password;
		this.email = email;
		this.provider = "LOCAL";
	}
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
}
