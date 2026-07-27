package com.syncdrive.chat.service;

import com.syncdrive.chat.model.ChatMessage;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisPublisher {

    private static final int MAX_HISTORY_MESSAGES = 50;

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisPublisher(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publish(ChatMessage message) {
        if (ChatMessage.MessageType.CHAT.equals(message.getType())) {
            String historyKey = "chat:history:" + message.getRoomId();
            redisTemplate.opsForList().rightPush(historyKey, message);
            redisTemplate.opsForList().trim(historyKey, -MAX_HISTORY_MESSAGES, -1);
        }

        redisTemplate.convertAndSend("chat.room." + message.getRoomId(), message);
    }
}
