package com.syncdrive.chat.controller;

import java.util.List;
import java.util.Set;

import com.syncdrive.chat.client.RoomServiceClient;
import com.syncdrive.chat.model.ChatMessage;
import com.syncdrive.chat.service.RedisPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisPublisher redisPublisher;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomServiceClient roomServiceClient;

    public ChatController(RedisTemplate<String, Object> redisTemplate,
            RedisPublisher redisPublisher,
            SimpMessagingTemplate messagingTemplate,
            RoomServiceClient roomServiceClient) {
        this.redisTemplate = redisTemplate;
        this.redisPublisher = redisPublisher;
        this.messagingTemplate = messagingTemplate;
        this.roomServiceClient = roomServiceClient;
    }

    @GetMapping("/history/{roomId}")
    public List<Object> getChatHistory(@PathVariable String roomId) {
        return redisTemplate.opsForList().range(historyKey(roomId), 0, -1);
    }

    @MessageMapping("/chat/{roomId}/sendMessage")
    public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        roomServiceClient.roomExists(roomId);
        chatMessage.setRoomId(roomId);
        redisPublisher.publish(chatMessage);
    }

    @MessageMapping("/chat/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId,
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        roomServiceClient.roomExists(roomId);
        String username = chatMessage.getSenderId();
        Long userId = chatMessage.getUserId();

        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", username);
            headerAccessor.getSessionAttributes().put("userId", userId);
            headerAccessor.getSessionAttributes().put("roomId", roomId);
        }

        if (userId != null) {
            redisTemplate.opsForSet().add(participantKey(roomId), String.valueOf(userId));
        }

        chatMessage.setRoomId(roomId);
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        redisPublisher.publish(chatMessage);
        sendParticipantList(roomId);
    }

    private void sendParticipantList(String roomId) {
        Set<Object> activeUsers = redisTemplate.opsForSet().members(participantKey(roomId));
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/participants", activeUsers);
    }

    private String historyKey(String roomId) {
        return "chat:history:" + roomId;
    }

    private String participantKey(String roomId) {
        return "room:participants:" + roomId;
    }
}
