package com.syncdrive.chat.dto;

import java.util.List;

/**
 * A private request from the floating room assistant.
 *
 * Chat history is deliberately not accepted from the browser. The service reads
 * the authoritative room history from Redis and only accepts non-sensitive,
 * read-only UI state that already exists in RoomView.
 */
public record RoomAssistantRequest(
        String roomId,
        String mode,
        String question,
        RoomContext roomContext,
        List<ConversationTurn> conversation) {

    public record RoomContext(
            boolean host,
            String hostName,
            List<String> participantNames,
            String mediaName,
            String mediaType,
            boolean playing,
            double currentTime,
            double duration) {
    }

    public record ConversationTurn(String role, String content) {
    }
}
