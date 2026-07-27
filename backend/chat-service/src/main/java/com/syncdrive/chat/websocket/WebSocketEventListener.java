package com.syncdrive.chat.websocket;

import java.util.Set;

import com.syncdrive.chat.model.ChatMessage;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(RedisTemplate<String, Object> redisTemplate,
            SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        if (headerAccessor.getSessionAttributes() == null) {
            return;
        }

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if (username == null || userId == null || roomId == null) {
            return;
        }

        String participantKey = "room:participants:" + roomId;
        redisTemplate.opsForSet().remove(participantKey, String.valueOf(userId));

        Set<Object> activeUsers = redisTemplate.opsForSet().members(participantKey);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/participants", activeUsers);

        ChatMessage leaveMessage = new ChatMessage();
        leaveMessage.setRoomId(roomId);
        leaveMessage.setSenderId(username);
        leaveMessage.setContent(username + " left");
        leaveMessage.setType(ChatMessage.MessageType.LEAVE);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, leaveMessage);
    }
}
