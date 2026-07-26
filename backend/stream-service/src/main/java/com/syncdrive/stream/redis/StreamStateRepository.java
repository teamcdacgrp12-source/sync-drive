package com.syncdrive.stream.redis;

import java.util.Map;

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

	public void saveState(Long roomId, Map<String, Object> state) {
		redisTemplate.opsForHash().putAll(stateKey(roomId), state);
	}

	public Map<Object, Object> getState(Long roomId) {
		return redisTemplate.opsForHash().entries(stateKey(roomId));
	}

	public void delete(Long roomId) {
		redisTemplate.delete(stateKey(roomId));
	}
}
