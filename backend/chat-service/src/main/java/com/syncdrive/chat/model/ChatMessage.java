package com.syncdrive.chat.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * The data carried by a single message flowing through a room.
 *
 * This one class covers several kinds of events (see the MessageType enum): chat text,
 * join/leave notices, and video-sync commands. Chat and video sync deliberately
 * share the same channel/message shape so the frontend only needs one subscription.
 * Objects of this class are serialized to JSON when sent over WebSocket and Redis.
 */
public class ChatMessage {

    // The kind of message this is. The frontend and backend use this to decide how to react.
    public enum MessageType {
        JOIN,       // A user just entered the room
        CHAT,       // Ordinary text chat message (the only type saved to history)
        LEAVE,      // A user left the room
        SYSTEM,     // A service-generated room notice
        HOST_LEFT,  // The room's host left (frontend may end the session or promote someone)
        POLL_VOTE,  // A participant selected an option on a shared room poll
        SYNC        // Video-sync command (LOAD, PLAY, PAUSE, LOAD_YOUTUBE, HEARTBEAT)
                    // so all participants' players stay in step with the host
    }

    private MessageType type;

    // Which room this message belongs to. @JsonProperty keeps the JSON field name "roomId".
    @JsonProperty("roomId")
    private String roomId;

    // Map 'sender' (Frontend) to 'senderId' (Backend):
    // the JSON field is "sender" but we store it in the senderId Java field.
    @JsonProperty("sender")
    private String senderId;

    private String senderName;
    private String content;   // The message text, or the video-sync command details for SYNC
    private long timestamp;   // When the message was created (epoch millis)
    private ChatCard card;     // Optional structured UI card; plain content remains the fallback


    public ChatMessage() {
        this.timestamp = System.currentTimeMillis();
        this.type = MessageType.CHAT;
    }

    public ChatMessage(
            String roomId,
            String senderId,
            String senderName,
            String content,
            MessageType type) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.type = type;
        this.timestamp = System.currentTimeMillis();
    }
    // --- Getters and Setters ---

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }


    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public ChatCard getCard() {
        return card;
    }

    public void setCard(ChatCard card) {
        this.card = card;
    }

    // Numeric account id of the sender; used for presence tracking (the Redis Set stores user ids).
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Optional structured content attached to an ordinary CHAT message.
     * Older clients ignore this field and continue displaying {@code content}.
     */
    public static class ChatCard {

        private String type;
        private String title;
        private String summary;
        private String question;
        private List<String> options;
        private List<ChatCardSection> sections;
        private String pollId;
        private Integer selectedOption;
        private List<Integer> voteCounts;
        private int totalVotes;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public List<ChatCardSection> getSections() {
            return sections;
        }

        public void setSections(List<ChatCardSection> sections) {
            this.sections = sections;
        }

        public String getPollId() {
            return pollId;
        }

        public void setPollId(String pollId) {
            this.pollId = pollId;
        }

        public Integer getSelectedOption() {
            return selectedOption;
        }

        public void setSelectedOption(Integer selectedOption) {
            this.selectedOption = selectedOption;
        }

        public List<Integer> getVoteCounts() {
            return voteCounts;
        }

        public void setVoteCounts(List<Integer> voteCounts) {
            this.voteCounts = voteCounts;
        }

        public int getTotalVotes() {
            return totalVotes;
        }

        public void setTotalVotes(int totalVotes) {
            this.totalVotes = totalVotes;
        }
    }

    public static class ChatCardSection {

        private String title;
        private List<String> items;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<String> getItems() {
            return items;
        }

        public void setItems(List<String> items) {
            this.items = items;
        }
    }
}
