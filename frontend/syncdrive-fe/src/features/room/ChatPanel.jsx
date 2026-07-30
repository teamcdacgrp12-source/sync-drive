import React, { useState, useRef, useEffect } from "react";
import { BarChart3, Check, Send, Sparkles } from "lucide-react";
import { sendMessage } from "../../socket/roomSocket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SharedAssistantCard = ({ card }) => {
  const sections = Array.isArray(card.sections)
    ? card.sections.filter(
        (section) => section?.title && Array.isArray(section.items),
      )
    : [];

  return (
    <div className="chat-poll-card chat-assistant-card">
      <div className="chat-poll-card__header">
        <span className="chat-poll-card__icon">
          <Sparkles size={14} />
        </span>
        <div>
          <span>Room Assistant</span>
          <strong>{card.title || "Room update"}</strong>
        </div>
      </div>

      {card.summary && (
        <p className="chat-assistant-card__summary">{card.summary}</p>
      )}

      {sections.map((section, sectionIndex) => (
        <section
          className="chat-assistant-card__section"
          key={`${section.title}-${sectionIndex}`}
        >
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

const SharedPollCard = ({ card, selectedOption, onVote }) => {
  const voteCounts =
    Array.isArray(card.voteCounts) &&
    card.voteCounts.length === card.options.length
      ? card.voteCounts.map((count) =>
          Number.isInteger(count) && count > 0 ? count : 0,
        )
      : card.options.map(() => 0);
  const totalVotes = voteCounts.reduce((total, count) => total + count, 0);
  const leadingVoteCount = Math.max(...voteCounts);

  return (
    <div className="chat-poll-card">
      <div className="chat-poll-card__header">
        <span className="chat-poll-card__icon">
          <Sparkles size={14} />
        </span>
        <div>
          <span>Room Assistant</span>
          <strong>{card.title || "Room poll"}</strong>
        </div>
      </div>

      {card.summary && (
        <p className="chat-poll-card__summary">{card.summary}</p>
      )}

      <div className="chat-poll-card__question">
        <BarChart3 size={15} />
        <h4>{card.question}</h4>
      </div>

      <div className="chat-poll-card__options">
        {card.options.map((option, optionIndex) => {
          const isSelected = selectedOption === optionIndex;
          const voteCount = voteCounts[optionIndex];
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isLeading = voteCount > 0 && voteCount === leadingVoteCount;
          return (
            <button
              type="button"
              className={`chat-poll-card__option ${
                isSelected ? "chat-poll-card__option--selected" : ""
              } ${isLeading ? "chat-poll-card__option--leading" : ""}`}
              key={`${option}-${optionIndex}`}
              onClick={() => onVote(optionIndex)}
              aria-pressed={isSelected}
              aria-label={`${option}: ${percentage} percent, ${voteCount} votes`}
            >
              <span
                className="chat-poll-card__progress"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
              />
              <span className="chat-poll-card__marker">
                {isSelected ? <Check size={13} /> : optionIndex + 1}
              </span>
              <span className="chat-poll-card__option-content">
                <span>{option}</span>
                <strong>
                  {isLeading && <span className="chat-poll-card__leader">Leading</span>}
                  {percentage}% · {voteCount}
                </strong>
              </span>
            </button>
          );
        })}
      </div>

      <p className="chat-poll-card__status">
        <span>
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
        <span>
          {Number.isInteger(selectedOption)
            ? "Your choice is selected."
            : "Choose an option to vote."}
        </span>
      </p>
    </div>
  );
};

const ChatPanel = ({ messages, roomCode, profileMap = {} }) => {
  const [newMessage, setNewMessage] = useState("");
  const [pollSelections, setPollSelections] = useState({});
  const messagesEndRef = useRef(null);

  const userData = JSON.parse(sessionStorage.getItem("syncdrive.user"));
  const currentUsername = userData?.username;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(roomCode, newMessage);
      setNewMessage("");
    }
  };

  const handlePollVote = (pollKey, card, optionIndex) => {
    setPollSelections((current) => ({
      ...current,
      [pollKey]: optionIndex,
    }));

    if (card.pollId) {
      sendMessage(roomCode, "", "POLL_VOTE", {
        card: {
          type: "POLL_VOTE",
          pollId: card.pollId,
          selectedOption: optionIndex,
        },
      });
    }
  };

  return (
    <div className="chat-panel flex h-full flex-col overflow-hidden">
      <div className="messages-list flex-1 overflow-y-auto p-2.5">
        {messages
          .filter((msg) => msg.type === "CHAT" && msg.content?.trim() !== "")
          .map((msg, index) => {
            const isMe = msg.sender === currentUsername;
            const isPoll =
              msg.card?.type === "POLL" &&
              Array.isArray(msg.card?.options) &&
              msg.card.options.length >= 2;
            const isAssistantCard =
              msg.card?.type === "ASSISTANT_RESPONSE" &&
              (msg.card.title ||
                msg.card.summary ||
                (Array.isArray(msg.card.sections) &&
                  msg.card.sections.length > 0));
            const hasCard = isPoll || isAssistantCard;
            const messageKey =
              msg.id ||
              `${msg.sender}-${msg.timestamp || "pending"}-${index}`;
            const pollKey =
              msg.card?.pollId ||
              `${messageKey}-${msg.card?.question || ""}`;

            const profileById =
              profileMap[msg.sender] || profileMap[Number(msg.sender)];

            const profileByUsername = !profileById
              ? Object.values(profileMap).find((p) => p.username === msg.sender)
              : null;

            const finalProfile = profileById || profileByUsername;
            const displayName =
              finalProfile?.displayName || finalProfile?.username || msg.sender;

            return (
              <div
                key={messageKey}
                className={`message-bubble ${isMe ? "my-message" : ""} ${
                  hasCard ? "poll-message" : ""
                }`}
              >
                {!isMe && <span className="sender-name">{displayName}</span>}
                {isPoll ? (
                  <SharedPollCard
                    card={msg.card}
                    selectedOption={pollSelections[pollKey]}
                    onVote={(optionIndex) =>
                      handlePollVote(pollKey, msg.card, optionIndex)
                    }
                  />
                ) : isAssistantCard ? (
                  <SharedAssistantCard card={msg.card} />
                ) : (
                  <div className="message-content">{msg.content}</div>
                )}
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex min-h-[72px] items-center gap-2.5 border-t border-border/60 bg-card p-4">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="h-11 rounded-xl"
        />
        <Button onClick={handleSend} className="h-11 rounded-xl px-5">
          Send
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
