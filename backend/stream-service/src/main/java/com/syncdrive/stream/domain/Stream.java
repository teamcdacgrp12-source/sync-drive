package com.syncdrive.stream.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "streams")
public class Stream {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "room_id", nullable = false)
	private Long roomId;

	@Column(name = "host_user_id", nullable = false)
	private Long hostUserId;

	@Enumerated(EnumType.STRING)
	@Column(name = "stream_type", nullable = false, length = 20)
	private StreamType streamType;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private StreamStatus status;

	@Column(name = "media_source", columnDefinition = "TEXT")
	private String mediaSource;

	@Column(name = "playback_time")
	private Double playbackTime = 0.0;

	@Column(name = "started_at")
	private Instant startedAt;

	@Column(name = "updated_at")
	private Instant updatedAt;

	protected Stream() { }

	public Stream(Long roomId, Long hostUserId, StreamType streamType, String mediaSource) {
		this.roomId = roomId;
		this.hostUserId = hostUserId;
		this.streamType = streamType;
		this.mediaSource = mediaSource;
		this.status = StreamStatus.IDLE;
		this.updatedAt = Instant.now();
	}

	public Long getId() { return id; }
	public Long getRoomId() { return roomId; }
	public Long getHostUserId() { return hostUserId; }
	public StreamType getStreamType() { return streamType; }
	public StreamStatus getStatus() { return status; }
	public String getMediaSource() { return mediaSource; }
	public Double getPlaybackTime() { return playbackTime; }
	public Instant getStartedAt() { return startedAt; }
	public Instant getUpdatedAt() { return updatedAt; }

	public void start() {
		status = StreamStatus.STARTED;
		startedAt = Instant.now();
		updatedAt = Instant.now();
	}

	public void pause(Double playbackTime) {
		status = StreamStatus.PAUSED;
		this.playbackTime = playbackTime;
		updatedAt = Instant.now();
	}

	public void resume(Double playbackTime) {
		status = StreamStatus.STARTED;
		this.playbackTime = playbackTime;
		updatedAt = Instant.now();
	}

	public void stop() {
		status = StreamStatus.STOPPED;
		updatedAt = Instant.now();
	}

	public boolean isActive() {
		return status == StreamStatus.STARTED || status == StreamStatus.PAUSED;
	}
}
