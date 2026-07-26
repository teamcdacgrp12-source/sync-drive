package com.syncdrive.stream.redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class StreamStateRepository {

	private final RedisTemplate<String, Object> redisTemplate;

	public StreamStateRepository(RedisTemplate<String, Object> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	private String stateKey(Long roomId) {
		return "stream:" + roomId;
	}
}
