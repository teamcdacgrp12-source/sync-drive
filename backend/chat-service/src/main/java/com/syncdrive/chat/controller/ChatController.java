package com.syncdrive.chat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncdrive.chat.client.RoomServiceClient;
import com.syncdrive.chat.dto.RoomAssistantRequest;
import com.syncdrive.chat.dto.RoomAssistantResponse;
import com.syncdrive.chat.model.ChatMessage;
import com.syncdrive.chat.model.ChatMessage.ChatCard;
import com.syncdrive.chat.model.ChatMessage.ChatCardSection;
import com.syncdrive.chat.service.RedisPublisher;
import com.syncdrive.chat.service.RoomAssistantService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Handles chat-related requests for a room, both plain HTTP and real-time STOMP.
 *
 * Responsibilities:
 *  - HTTP: serve the recent message history for a room.
 *  - STOMP: accept chat/video-sync messages from clients and publish them; handle a
 *    user joining a room (record presence, remember their identity, announce them).
 *
 * Note it does not push messages to browsers itself; it hands them to RedisPublisher,
 * and RedisSubscriber does the actual delivery. This keeps everything Pub/Sub based.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Duration POLL_TTL = Duration.ofHours(24);

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisPublisher redisPublisher;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomAssistantService roomAssistantService;
    private final ObjectMapper objectMapper;
    private final RoomServiceClient roomServiceClient;

    public ChatController(RedisTemplate<String, Object> redisTemplate,
            RedisPublisher redisPublisher,
            SimpMessagingTemplate messagingTemplate,
            RoomAssistantService roomAssistantService,
            ObjectMapper objectMapper,
            RoomServiceClient roomServiceClient) {
        this.redisTemplate = redisTemplate;
        this.redisPublisher = redisPublisher;
        this.messagingTemplate = messagingTemplate;
        this.roomAssistantService = roomAssistantService;
        this.objectMapper = objectMapper;
        this.roomServiceClient = roomServiceClient;
    }

    // --- HTTP ENDPOINT (History) ---
    /**
     * GET /api/chat/history/{roomId}
     * Returns the saved recent messages for a room so a browser can populate the chat
     * log immediately on load. range(0, -1) reads the entire stored list from Redis.
     */
    @GetMapping("/history/{roomId}")
    public List<ChatMessage> getChatHistory(@PathVariable String roomId) {
        List<Object> stored = redisTemplate.opsForList()
                .range("chat:history:" + roomId, 0, -1);
        if (stored == null || stored.isEmpty()) {
            return List.of();
        }

        List<ChatMessage> history = new ArrayList<>();
        for (Object value : stored) {
            try {
                ChatMessage message = value instanceof ChatMessage chatMessage
                        ? chatMessage
                        : objectMapper.convertValue(value, ChatMessage.class);
                enrichPollVoteTotals(roomId, message);
                history.add(message);
            } catch (IllegalArgumentException ignored) {
                // One malformed historic entry should not block the room history.
            }
        }
        return history;
    }

    /**
     * Produces a private assistant answer for the authenticated room participant.
     * The gateway supplies X-USER-ID after validating the user's JWT.
     */
    @PostMapping("/assistant")
    public RoomAssistantResponse askRoomAssistant(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody RoomAssistantRequest request) {
        return roomAssistantService.ask(userId, request);
    }

    // --- STOMP ENDPOINTS ---

    /**
     * Handles a client sending a message to /app/chat/{roomId}/sendMessage.
     * Covers both normal chat and video-sync (SYNC) messages, then publishes them so
     * every participant receives them in real time.
     */
    @MessageMapping("/chat/{roomId}/sendMessage")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        roomServiceClient.roomExists(roomId);
        chatMessage.setRoomId(roomId); // trust the room from the URL, not the client payload
        if (chatMessage.getTimestamp() <= 0) {
            chatMessage.setTimestamp(System.currentTimeMillis());
        }
        if (chatMessage.getType() == ChatMessage.MessageType.POLL_VOTE) {
            handlePollVote(roomId, chatMessage, headerAccessor);
            return;
        }
        sanitizeChatCard(chatMessage);
        if (chatMessage.getType() == ChatMessage.MessageType.CHAT
                && chatMessage.getCard() != null
                && "POLL".equals(chatMessage.getCard().getType())) {
            registerPoll(roomId, chatMessage.getCard());
        }
        if (chatMessage.getType() == ChatMessage.MessageType.SYNC) {
            // SYNC messages carry video playback commands sharing the same channel as chat.
            System.out.println("SYNC received and publishing to room " + roomId);
        }
        redisPublisher.publish(chatMessage); // hand off to Redis; delivery happens via RedisSubscriber
    }

    private void sanitizeChatCard(ChatMessage message) {
        ChatCard requestedCard = message.getCard();
        if (message.getType() != ChatMessage.MessageType.CHAT || requestedCard == null) {
            message.setCard(null);
            return;
        }

        String cardType = safeCardText(requestedCard.getType(), 30)
                .toUpperCase(Locale.ROOT);
        if ("ASSISTANT_RESPONSE".equals(cardType)) {
            sanitizeAssistantResponseCard(message, requestedCard);
            return;
        }
        if (!"POLL".equals(cardType)) {
            message.setCard(null);
            return;
        }

        String question = safeCardText(requestedCard.getQuestion(), 180);
        if (question.isBlank() || requestedCard.getOptions() == null) {
            message.setCard(null);
            return;
        }

        Set<String> normalizedOptions = new LinkedHashSet<>();
        List<String> safeOptions = new ArrayList<>();
        for (String requestedOption : requestedCard.getOptions()) {
            if (safeOptions.size() >= 6) {
                break;
            }
            String option = safeCardText(requestedOption, 90);
            if (option.isBlank()
                    || !normalizedOptions.add(option.toLowerCase(Locale.ROOT))) {
                continue;
            }
            safeOptions.add(option);
        }

        if (safeOptions.size() < 2) {
            message.setCard(null);
            return;
        }

        ChatCard safeCard = new ChatCard();
        safeCard.setType("POLL");
        safeCard.setTitle(safeCardText(requestedCard.getTitle(), 80));
        safeCard.setSummary(safeCardText(requestedCard.getSummary(), 240));
        safeCard.setQuestion(question);
        safeCard.setOptions(List.copyOf(safeOptions));
        safeCard.setSections(List.of());
        String requestedPollId = safeCardText(requestedCard.getPollId(), 64);
        safeCard.setPollId(requestedPollId.matches("[A-Za-z0-9-]{8,64}")
                ? requestedPollId
                : UUID.randomUUID().toString());
        safeCard.setSelectedOption(null);
        safeCard.setVoteCounts(zeroVoteCounts(safeOptions.size()));
        safeCard.setTotalVotes(0);
        message.setCard(safeCard);
    }

    private void sanitizeAssistantResponseCard(
            ChatMessage message,
            ChatCard requestedCard) {
        String title = safeCardText(requestedCard.getTitle(), 80);
        String summary = safeCardText(requestedCard.getSummary(), 700);
        List<ChatCardSection> sections = sanitizeCardSections(requestedCard.getSections());

        if (title.isBlank() && summary.isBlank() && sections.isEmpty()) {
            message.setCard(null);
            return;
        }

        ChatCard safeCard = new ChatCard();
        safeCard.setType("ASSISTANT_RESPONSE");
        safeCard.setTitle(title);
        safeCard.setSummary(summary);
        safeCard.setQuestion("");
        safeCard.setOptions(List.of());
        safeCard.setSections(sections);
        safeCard.setPollId("");
        safeCard.setSelectedOption(null);
        safeCard.setVoteCounts(List.of());
        safeCard.setTotalVotes(0);
        message.setCard(safeCard);
    }

    private List<ChatCardSection> sanitizeCardSections(
            List<ChatCardSection> requestedSections) {
        if (requestedSections == null) {
            return List.of();
        }

        List<ChatCardSection> safeSections = new ArrayList<>();
        for (ChatCardSection requestedSection : requestedSections) {
            if (requestedSection == null || safeSections.size() >= 4) {
                continue;
            }

            String title = safeCardText(requestedSection.getTitle(), 60);
            if (title.isBlank() || requestedSection.getItems() == null) {
                continue;
            }

            List<String> items = new ArrayList<>();
            for (String requestedItem : requestedSection.getItems()) {
                if (items.size() >= 6) {
                    break;
                }
                String item = safeCardText(requestedItem, 280);
                if (!item.isBlank()) {
                    items.add(item);
                }
            }

            if (!items.isEmpty()) {
                ChatCardSection safeSection = new ChatCardSection();
                safeSection.setTitle(title);
                safeSection.setItems(List.copyOf(items));
                safeSections.add(safeSection);
            }
        }

        return List.copyOf(safeSections);
    }

    private void registerPoll(String roomId, ChatCard card) {
        String pollKey = pollKey(roomId, card.getPollId());
        redisTemplate.opsForValue().set(
                pollKey + ":option-count",
                card.getOptions().size(),
                POLL_TTL);
        redisTemplate.expire(pollKey + ":votes", POLL_TTL);
    }

    private void handlePollVote(
            String roomId,
            ChatMessage request,
            SimpMessageHeaderAccessor headerAccessor) {
        ChatCard vote = request.getCard();
        if (vote == null
                || !"POLL_VOTE".equalsIgnoreCase(vote.getType())
                || vote.getSelectedOption() == null) {
            return;
        }

        String pollId = safeCardText(vote.getPollId(), 64);
        if (!pollId.matches("[A-Za-z0-9-]{8,64}")) {
            return;
        }

        Object sessionUserId = headerAccessor.getSessionAttributes() == null
                ? null
                : headerAccessor.getSessionAttributes().get("userId");
        if (sessionUserId == null) {
            return;
        }

        String pollKey = pollKey(roomId, pollId);
        int optionCount = readOptionCount(pollKey + ":option-count");
        int selectedOption = vote.getSelectedOption();
        if (optionCount < 2 || selectedOption < 0 || selectedOption >= optionCount) {
            return;
        }

        String votesKey = pollKey + ":votes";
        redisTemplate.opsForHash().put(
                votesKey,
                String.valueOf(sessionUserId),
                selectedOption);
        redisTemplate.expire(votesKey, POLL_TTL);
        redisTemplate.expire(pollKey + ":option-count", POLL_TTL);

        List<Integer> voteCounts = loadVoteCounts(votesKey, optionCount);
        ChatCard updateCard = new ChatCard();
        updateCard.setType("POLL_VOTE");
        updateCard.setPollId(pollId);
        updateCard.setVoteCounts(voteCounts);
        updateCard.setTotalVotes(voteCounts.stream().mapToInt(Integer::intValue).sum());

        ChatMessage update = new ChatMessage();
        update.setType(ChatMessage.MessageType.POLL_VOTE);
        update.setRoomId(roomId);
        update.setSenderId(request.getSenderId());
        update.setTimestamp(System.currentTimeMillis());
        update.setCard(updateCard);
        redisPublisher.publish(update);
    }

    private void enrichPollVoteTotals(String roomId, ChatMessage message) {
        ChatCard card = message.getCard();
        if (message.getType() != ChatMessage.MessageType.CHAT
                || card == null
                || !"POLL".equals(card.getType())
                || card.getPollId() == null
                || card.getOptions() == null) {
            return;
        }

        List<Integer> voteCounts = loadVoteCounts(
                pollKey(roomId, card.getPollId()) + ":votes",
                card.getOptions().size());
        card.setVoteCounts(voteCounts);
        card.setTotalVotes(voteCounts.stream().mapToInt(Integer::intValue).sum());
    }

    private List<Integer> loadVoteCounts(String votesKey, int optionCount) {
        List<Integer> counts = new ArrayList<>(zeroVoteCounts(optionCount));
        List<Object> votes = redisTemplate.opsForHash().values(votesKey);
        for (Object value : votes) {
            try {
                int option = Integer.parseInt(String.valueOf(value));
                if (option >= 0 && option < counts.size()) {
                    counts.set(option, counts.get(option) + 1);
                }
            } catch (NumberFormatException ignored) {
                // Ignore one malformed stored vote without hiding valid totals.
            }
        }
        return List.copyOf(counts);
    }

    private List<Integer> zeroVoteCounts(int optionCount) {
        List<Integer> counts = new ArrayList<>();
        for (int index = 0; index < optionCount; index++) {
            counts.add(0);
        }
        return List.copyOf(counts);
    }

    private int readOptionCount(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private String pollKey(String roomId, String pollId) {
        return "room:poll:" + roomId + ":" + pollId;
    }

    private String safeCardText(String value, int maximumLength) {
        if (value == null) {
            return "";
        }
        String normalized = value.strip();
        return normalized.length() <= maximumLength
                ? normalized
                : normalized.substring(0, maximumLength);
    }

    /**
     * Handles a client joining a room (sent to /app/chat/{roomId}/join).
     * Records the user in the room's presence Set, stores their identity in the
     * WebSocket session (needed later for disconnect cleanup), then announces the join
     * and broadcasts the refreshed participant list.
     */
    @MessageMapping("/chat/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId,
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {

        roomServiceClient.roomExists(roomId);
        String username = chatMessage.getSenderId();
        Long userId = chatMessage.getUserId(); // 5. Get User ID

        // 1. Add User to Session (so we know who to remove when they disconnect).
        // The disconnect event has no message body, so we stash identity here now and
        // read it back in WebSocketEventListener when the socket drops.
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", username);
            headerAccessor.getSessionAttributes().put("userId", userId); // 6. Store ID
            headerAccessor.getSessionAttributes().put("roomId", roomId);
        }

        // 2. Add to Redis Set (Unique list of USER IDs now).
        // A Set is used because it automatically ignores duplicates, so a user joining
        // twice (e.g. reconnect) is still counted once.
        String participantKey = "room:participants:" + roomId;
        // Store as String to match Redis Set behavior
        redisTemplate.opsForSet().add(participantKey, String.valueOf(userId));

        // 3. Broadcast JOIN message (for Chat Log)
        chatMessage.setRoomId(roomId);
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        chatMessage.setTimestamp(System.currentTimeMillis());
        redisPublisher.publish(chatMessage);

        // 4. Broadcast UPDATED PARTICIPANT LIST (for Sidebar)
        sendParticipantList(roomId);
    }

    // --- Helper to Send List ---
    /**
     * Reads the current members of a room's presence Set and pushes the list to the
     * room's "participants" topic, so every client's sidebar shows who is present.
     */
    private void sendParticipantList(String roomId) {
        String participantKey = "room:participants:" + roomId;
        Set<Object> activeUsers = redisTemplate.opsForSet().members(participantKey); // everyone currently in the room

        // Send to "/topic/room/{roomId}/participants"
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/participants", activeUsers);

        System.out.println("Updated Participants for " + roomId + ": " + activeUsers);
    }
}
