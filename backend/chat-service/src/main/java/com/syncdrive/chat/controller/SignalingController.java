package com.syncdrive.chat.controller;

import com.syncdrive.chat.client.RoomServiceClient;
import com.syncdrive.chat.model.SignalMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomServiceClient roomServiceClient;

    public SignalingController(SimpMessagingTemplate messagingTemplate, RoomServiceClient roomServiceClient) {
        this.messagingTemplate = messagingTemplate;
        this.roomServiceClient = roomServiceClient;
    }

    @MessageMapping("/chat/{roomId}/signal")
    public void handleSignal(@DestinationVariable String roomId,
            @Payload SignalMessage message,
            SimpMessageHeaderAccessor headerAccessor) {
        roomServiceClient.roomExists(roomId);
        message.setRoomId(roomId);

        if (headerAccessor.getSessionAttributes() != null) {
            String sessionUsername = (String) headerAccessor.getSessionAttributes().get("username");
            if (sessionUsername != null) {
                message.setSenderId(sessionUsername);
            }
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/signal", message);
    }
}
