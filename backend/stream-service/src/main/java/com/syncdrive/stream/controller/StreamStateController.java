package com.syncdrive.stream.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.syncdrive.stream.redis.StreamStateRepository;

@RestController
@RequestMapping("/api/streams")
public class StreamStateController {
	private final StreamStateRepository streamStateRepository;
	public StreamStateController(StreamStateRepository streamStateRepository) { this.streamStateRepository = streamStateRepository; }

	@GetMapping("/state")
	public Map<String, Object> getStreamState(@RequestParam Long roomId) {
		Map<Object, Object> rawState = streamStateRepository.getState(roomId);
		if (rawState == null || rawState.isEmpty()) return Map.of("status", "STOPPED");
		Map<String, Object> state = new HashMap<>();
		rawState.forEach((key, value) -> state.put(String.valueOf(key), value));
		return state;
	}
}
