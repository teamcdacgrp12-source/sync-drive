package com.syncdrive.chat.service;

import com.syncdrive.chat.model.ChatMessage;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Sends outgoing messages into Redis.
 *
 * Every message produced anywhere in this service goes through here. It does two jobs:
 *  1) Persists CHAT messages to a per-room history list (so late joiners can load
 *     recent messages).
 *  2) Publishes ALL messages to the room's Redis Pub/Sub channel, which is how the
 *     message eventually reaches connected browsers (via RedisSubscriber). Going through
 *     Redis rather than pushing to STOMP directly is what lets multiple service instances
 *     stay in sync.
 */
@Component
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisPublisher(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Saves chat history (chat messages only) and then broadcasts the message to the
     * room channel so it can be delivered in real time.
     */
    public void publish(ChatMessage message) {
        // 🔴 FIX: Only save to history if it's a real CHAT message
        // (JOIN/LEAVE/SYNC are transient events, not worth persisting).
        if (ChatMessage.MessageType.CHAT.equals(message.getType())) {
            String historyKey = "chat:history:" + message.getRoomId();
            redisTemplate.opsForList().rightPush(historyKey, message); // append to the end of the list

            // Keep only the newest 50 messages. Negative indexes count from the
            // right side of the list, where rightPush appends new messages.
            redisTemplate.opsForList().trim(historyKey, -50, -1);
        }

        // 2. Publish EVERYTHING (Join, Leave, Chat) to the topic so real-time works.
        // We publish to the Redis channel (not directly to WebSocket clients) so that
        // every running instance of chat-service, subscribed to "chat.room.*", gets it
        // and can forward it to its own connected users.
        String channel = "chat.room." + message.getRoomId();
        redisTemplate.convertAndSend(channel, message);
    }
}
