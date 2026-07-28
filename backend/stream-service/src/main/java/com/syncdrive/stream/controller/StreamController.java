package com.syncdrive.stream.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.syncdrive.stream.domain.Stream;
import com.syncdrive.stream.dto.PauseStreamRequest;
import com.syncdrive.stream.dto.StartStreamRequest;
import com.syncdrive.stream.dto.StopStreamRequest;
import com.syncdrive.stream.service.StreamService;

@RestController
@RequestMapping("/api/streams")
public class StreamController {
	private final StreamService streamService;
	public StreamController(StreamService streamService) { this.streamService = streamService; }

	@PostMapping("/start")
	@ResponseStatus(HttpStatus.CREATED)
	public Stream startStream(@RequestBody StartStreamRequest request) {
		return streamService.startStream(request.roomId(), request.userId(), request.type(), request.source());
	}

	@PostMapping("/pause")
	public Stream pauseStream(@RequestBody PauseStreamRequest request) {
		return streamService.pauseStream(request.roomId(), request.userId(), request.time());
	}

	@PostMapping("/stop")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void stopStream(@RequestBody StopStreamRequest request) {
		streamService.stopStream(request.roomId(), request.userId());
	}
}
