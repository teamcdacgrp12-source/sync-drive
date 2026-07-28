package com.syncdrive.stream.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.syncdrive.stream.client.RoomServiceClient;
import com.syncdrive.stream.domain.Stream;
import com.syncdrive.stream.domain.StreamType;
import com.syncdrive.stream.redis.StreamStateRepository;
import com.syncdrive.stream.repository.StreamRepository;

@Service
public class StreamService {

	private final StreamRepository streamRepository;
	private final RoomServiceClient roomServiceClient;
	private final StreamStateRepository streamStateRepository;

	public StreamService(StreamRepository streamRepository, RoomServiceClient roomServiceClient,
			StreamStateRepository streamStateRepository) {
		this.streamRepository = streamRepository;
		this.roomServiceClient = roomServiceClient;
		this.streamStateRepository = streamStateRepository;
	}

	public Stream startStream(Long roomId, Long userId, StreamType type, String source) {
		Long hostId = verifyHost(roomId, userId, "start");
		Stream stream = streamRepository.findByRoomId(roomId).orElse(new Stream(roomId, hostId, type, source));
		stream.start();
		streamStateRepository.saveState(roomId, Map.of("status", stream.getStatus().name(), "media", source, "time", 0.0));
		return streamRepository.save(stream);
	}

	public Stream pauseStream(Long roomId, Long userId, Double time) {
		verifyHost(roomId, userId, "pause");
		Stream stream = findStream(roomId);
		stream.pause(time);
		streamStateRepository.saveState(roomId, Map.of("status", stream.getStatus().name(), "time", time));
		return streamRepository.save(stream);
	}

	public void stopStream(Long roomId, Long userId) {
		verifyHost(roomId, userId, "stop");
		Stream stream = findStream(roomId);
		stream.stop();
		streamStateRepository.delete(roomId);
		streamRepository.save(stream);
	}

	private Long verifyHost(Long roomId, Long userId, String action) {
		Long hostId = roomServiceClient.getHostUserId(roomId);
		if (!hostId.equals(userId)) throw new IllegalStateException("Only host can " + action + " stream");
		return hostId;
	}

	private Stream findStream(Long roomId) {
		return streamRepository.findByRoomId(roomId).orElseThrow(() -> new IllegalStateException("Stream not found"));
	}
}
