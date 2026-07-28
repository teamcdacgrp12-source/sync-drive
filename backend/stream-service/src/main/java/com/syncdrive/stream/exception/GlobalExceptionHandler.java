package com.syncdrive.stream.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<?> handleIllegalState(IllegalStateException exception) {
		return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now(), "error", exception.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleGeneric(Exception exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("timestamp", Instant.now(), "error", "Internal server error"));
	}
}
