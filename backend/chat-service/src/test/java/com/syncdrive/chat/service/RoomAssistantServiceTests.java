package com.syncdrive.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncdrive.chat.dto.RoomAssistantRequest;
import com.syncdrive.chat.dto.RoomAssistantResponse;
import com.syncdrive.chat.model.ChatMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomAssistantServiceTests {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private SetOperations<String, Object> setOperations;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private ListOperations<String, Object> listOperations;

    private RoomAssistantService assistantService;

    @BeforeEach
    void setUp() {
        assistantService = new RoomAssistantService(
                redisTemplate,
                new ObjectMapper(),
                RestClient.builder(),
                "",
                "gpt-5.6-sol",
                "https://api.openai.com/v1");
    }

    @Test
    void returnsHelpfulCatchUpWithoutCallingOpenAiWhenHistoryIsEmpty() {
        allowParticipant();
        when(redisTemplate.opsForList()).thenReturn(listOperations);
        when(listOperations.range("chat:history:ROOM1", -50, -1)).thenReturn(List.of());

        RoomAssistantResponse response = assistantService.ask(
                7L,
                request("CATCH_UP"));

        assertEquals("ANSWER", response.responseType());
        assertEquals("You're all caught up", response.title());
        assertEquals(
                "No one has sent a recent room message yet. You haven't missed anything in the chat.",
                response.summary());
        assertEquals(0, response.sections().size());
        assertEquals(0, response.poll().options().size());
        assertEquals(0, response.chatMessagesUsed());
    }

    @Test
    void rejectsUsersWhoAreNotCurrentlyInTheRoom() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.isMember("room:participants:ROOM1", "7")).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> assistantService.ask(7L, request("ROOM_HELP")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void reportsMissingBackendKeyWithoutExposingASecret() {
        allowParticipant();
        when(redisTemplate.opsForList()).thenReturn(listOperations);

        ChatMessage message = new ChatMessage();
        message.setType(ChatMessage.MessageType.CHAT);
        message.setSenderId("sam");
        message.setContent("Should we watch the second movie next?");
        when(listOperations.range("chat:history:ROOM1", -50, -1))
                .thenReturn(List.of(message));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> assistantService.ask(7L, request("INSIGHTS")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }

    @Test
    void parsesPollResponsesForTheInteractiveAssistantCard() {
        RoomAssistantResponse response = assistantService.parseStructuredResponse(
                """
                        {
                          "responseType": "POLL",
                          "title": "Quick room vote",
                          "summary": "Pick the option you prefer.",
                          "sections": [],
                          "poll": {
                            "question": "Should we watch another AI video?",
                            "options": ["Yes", "Not today", "Let the host choose"]
                          }
                        }
                        """,
                4);

        assertEquals("POLL", response.responseType());
        assertEquals("Should we watch another AI video?", response.poll().question());
        assertEquals(3, response.poll().options().size());
        assertEquals(4, response.chatMessagesUsed());
    }

    @Test
    void parsesFriendlyAnswerSectionsForCleanUiRendering() {
        RoomAssistantResponse response = assistantService.parseStructuredResponse(
                """
                        {
                          "responseType": "ANSWER",
                          "title": "Here's what you missed",
                          "summary": "The host has been chatting about enjoying AI.",
                          "sections": [
                            {
                              "title": "Main topic",
                              "items": ["Whether everyone else likes AI too."]
                            }
                          ],
                          "poll": {
                            "question": "",
                            "options": []
                          }
                        }
                        """,
                4);

        assertEquals("ANSWER", response.responseType());
        assertEquals("Here's what you missed", response.title());
        assertEquals(1, response.sections().size());
        assertEquals(0, response.poll().options().size());
    }

    private void allowParticipant() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.isMember("room:participants:ROOM1", "7")).thenReturn(true);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(
                anyString(),
                any(),
                any(Duration.class)))
                .thenReturn(true);
    }

    private RoomAssistantRequest request(String mode) {
        return new RoomAssistantRequest(
                "ROOM1",
                mode,
                "Help me",
                null,
                List.of());
    }
}
