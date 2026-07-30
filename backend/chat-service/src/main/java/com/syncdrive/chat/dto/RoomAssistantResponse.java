package com.syncdrive.chat.dto;

import java.util.List;

/**
 * Private assistant output returned only to the requesting browser.
 */
public record RoomAssistantResponse(
        String answer,
        String responseType,
        String title,
        String summary,
        List<Section> sections,
        Poll poll,
        int chatMessagesUsed,
        long generatedAt) {

    public record Section(String title, List<String> items) {
    }

    public record Poll(String question, List<String> options) {
    }
}
