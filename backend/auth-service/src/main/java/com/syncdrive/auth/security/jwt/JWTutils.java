package com.syncdrive.auth.security.jwt;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.syncdrive.auth.security.services.UserDetailsImplementation;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTutils {
	private static final Logger logger = LoggerFactory.getLogger(JWTutils.class);
	@Value("${jwt.secret}") private String jwtSecret;
	@Value("${jwt.expiration-ms}") private int jwtExpiration;

	private Key getSigningKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
	}

	public String generateJWTtoken(Authentication authentication) {
		UserDetailsImplementation userPrincipal = (UserDetailsImplementation) authentication.getPrincipal();
		return Jwts.builder().setSubject(userPrincipal.getUsername()).claim("userId", userPrincipal.getId())
				.setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
				.signWith(getSigningKey()).compact();
	}

	public String getUserNameFromJwtToken(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
	}

	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
			return true;
		} catch (MalformedJwtException exception) {
			logger.error("Invalid JWT token: {}", exception.getMessage());
		} catch (ExpiredJwtException exception) {
			logger.error("JWT token is expired: {}", exception.getMessage());
		} catch (UnsupportedJwtException exception) {
			logger.error("JWT token is unsupported: {}", exception.getMessage());
		} catch (IllegalArgumentException exception) {
			logger.error("JWT claims string is empty: {}", exception.getMessage());
		}
		return false;
	}
}
