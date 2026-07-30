import React, { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  ListChecks,
  LoaderCircle,
  MessageCircleMore,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { assistantApi } from "../../api/assistant.api";
import "./room-assistant.css";

const FEATURES = [
  {
    mode: "CATCH_UP",
    label: "Catch me up",
    description: "Summarize the recent room conversation.",
    prompt: "Catch me up on the recent room chat.",
    icon: MessageCircleMore,
  },
  {
    mode: "ROOM_HELP",
    label: "Room assistant",
    description: "Explain what is happening and how controls work.",
    prompt: "Tell me the current room status and the most useful controls for me.",
    icon: CircleHelp,
  },
  {
    mode: "INSIGHTS",
    label: "Conversation insights",
    description: "Find decisions, suggestions, and open questions.",
    prompt: "Extract the decisions, suggestions, and unanswered questions from the recent chat.",
    icon: ListChecks,
  },
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I can catch you up on chat, explain the current room, or organize the conversation into decisions and open questions.",
};

const AssistantResponseContent = ({ message, selectedOption, onVote }) => {
  if (!message.title) {
    return <p>{message.content}</p>;
  }

  const isPoll =
    message.responseType === "POLL" && message.poll?.options?.length >= 2;

  return (
    <div className="room-assistant__response">
      <div className="room-assistant__response-heading">
        {isPoll ? <BarChart3 size={15} /> : <Sparkles size={15} />}
        <h3>{message.title}</h3>
      </div>

      {message.summary && (
        <p className="room-assistant__response-summary">{message.summary}</p>
      )}

      {message.sections?.map((section, sectionIndex) => (
        <section
          className="room-assistant__response-section"
          key={`${message.id}-section-${sectionIndex}`}
        >
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item, itemIndex) => (
              <li key={`${message.id}-item-${sectionIndex}-${itemIndex}`}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {isPoll && (
        <section className="room-assistant__poll">
          <div className="room-assistant__poll-label">
            <BarChart3 size={13} />
            Quick poll
          </div>
          <h4>{message.poll.question}</h4>
          <div className="room-assistant__poll-options">
            {message.poll.options.map((option, optionIndex) => {
              const isSelected = selectedOption === optionIndex;
              return (
                <button
                  type="button"
                  className={`room-assistant__poll-option ${
                    isSelected ? "room-assistant__poll-option--selected" : ""
                  }`}
                  key={`${message.id}-poll-${optionIndex}`}
                  onClick={() => onVote(optionIndex)}
                  aria-pressed={isSelected}
                >
                  <span className="room-assistant__poll-option-marker">
                    {isSelected ? <Check size={12} /> : optionIndex + 1}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
          <p className="room-assistant__poll-status">
            {Number.isInteger(selectedOption)
              ? "Your choice is saved in this panel. You can change it anytime."
              : "Choose one option to vote."}
          </p>
        </section>
      )}
    </div>
  );
};

const RoomAssistant = ({ roomCode, getRoomContext, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedMessageId, setSharedMessageId] = useState(null);
  const [pollSelections, setPollSelections] = useState({});
  const requestSequence = useRef(0);

  const conversation = useMemo(
    () =>
      messages
        .filter((message) => message.id !== WELCOME_MESSAGE.id)
        .slice(-6)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const submitRequest = async (question, mode = "QUESTION") => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    const requestId = ++requestSequence.current;
    const userMessage = {
      id: `user-${requestId}`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);
    setSharedMessageId(null);

    try {
      const response = await assistantApi.ask({
        roomId: roomCode,
        mode,
        question: trimmedQuestion,
        roomContext: getRoomContext(),
        conversation,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${requestId}`,
          role: "assistant",
          content: response.data.answer,
          responseType: response.data.responseType,
          title: response.data.title,
          summary: response.data.summary,
          sections: response.data.sections || [],
          poll: response.data.poll,
          chatMessagesUsed: response.data.chatMessagesUsed,
        },
      ]);
    } catch (error) {
      const status = error.response?.status;
      const serverMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error;

      let content =
        serverMessage ||
        "I couldn't reach the room assistant. Please try again in a moment.";

      if (status === 503) {
        content =
          "The room assistant is not configured yet. Add OPENAI_API_KEY to the chat-service environment and restart it.";
      } else if (status === 429) {
        content = "Please wait a few seconds before asking the assistant again.";
      } else if (status === 403) {
        content = "Reconnect to the room, then try the assistant again.";
      }

      setMessages((current) => [
        ...current,
        {
          id: `error-${requestId}`,
          role: "error",
          content,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitRequest(input);
  };

  const handleShare = (message) => {
    onShare(message);
    setSharedMessageId(message.id);
  };

  const handlePollVote = (messageId, optionIndex) => {
    setPollSelections((current) => ({
      ...current,
      [messageId]: optionIndex,
    }));
  };

  return (
    <div className={`room-assistant ${isOpen ? "room-assistant--open" : ""}`}>
      {isOpen && (
        <section
          className="room-assistant__panel"
          aria-label="Private room assistant"
        >
          <header className="room-assistant__header">
            <div className="room-assistant__identity">
              <div className="room-assistant__mini-orb" aria-hidden="true">
                <Bot size={18} />
              </div>
              <div>
                <div className="room-assistant__title-row">
                  <h2>Room assistant</h2>
                  <Sparkles size={14} />
                </div>
                <p>
                  <span className="room-assistant__status-dot" />
                  AI-powered · Private to you
                </p>
              </div>
            </div>
            <button
              type="button"
              className="room-assistant__icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close room assistant"
            >
              <X size={18} />
            </button>
          </header>

          <div className="room-assistant__content">
            {messages.length === 1 && (
              <div className="room-assistant__feature-list">
                <p className="room-assistant__eyebrow">How can I help?</p>
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      type="button"
                      className="room-assistant__feature"
                      key={feature.mode}
                      onClick={() =>
                        submitRequest(feature.prompt, feature.mode)
                      }
                      disabled={isLoading}
                    >
                      <span className="room-assistant__feature-icon">
                        <Icon size={18} />
                      </span>
                      <span>
                        <strong>{feature.label}</strong>
                        <small>{feature.description}</small>
                      </span>
                      <ChevronRight
                        className="room-assistant__feature-arrow"
                        size={17}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="room-assistant__messages" aria-live="polite">
              {messages.map((message) => (
                <div
                  className={`room-assistant__message room-assistant__message--${message.role}`}
                  key={message.id}
                >
                  {message.role !== "user" && (
                    <div className="room-assistant__message-avatar">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`room-assistant__bubble ${
                      message.responseType === "POLL"
                        ? "room-assistant__bubble--poll"
                        : ""
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <AssistantResponseContent
                        message={message}
                        selectedOption={pollSelections[message.id]}
                        onVote={(optionIndex) =>
                          handlePollVote(message.id, optionIndex)
                        }
                      />
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.role === "assistant" &&
                      message.id !== WELCOME_MESSAGE.id && (
                        <div className="room-assistant__message-actions">
                          {Number.isInteger(message.chatMessagesUsed) && (
                            <span>
                              {message.chatMessagesUsed} recent messages used
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleShare(message)}
                            disabled={sharedMessageId === message.id}
                          >
                            <Share2 size={13} />
                            {sharedMessageId === message.id
                              ? "Shared"
                              : message.responseType === "POLL"
                                ? "Share poll"
                                : "Share to room"}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="room-assistant__message room-assistant__message--assistant">
                  <div className="room-assistant__message-avatar">
                    <Bot size={15} />
                  </div>
                  <div className="room-assistant__typing" aria-label="Thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
          </div>

          <form className="room-assistant__composer" onSubmit={handleSubmit}>
            <div className="room-assistant__input-wrap">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about this room..."
                maxLength={600}
                disabled={isLoading}
                aria-label="Ask the room assistant"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send to room assistant"
              >
                {isLoading ? (
                  <LoaderCircle className="room-assistant__spinner" size={17} />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
            <p>Answers use recent room chat and playback status, not video content.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        className="room-assistant__launcher"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close room assistant" : "Open room assistant"}
        aria-expanded={isOpen}
      >
        <span className="room-assistant__launcher-glow" />
        <span className="room-assistant__launcher-icon">
          {isOpen ? <X size={23} /> : <Bot size={25} />}
        </span>
        {!isOpen && (
          <span className="room-assistant__launcher-label">
            <strong>Room AI</strong>
            <small>Need a catch-up?</small>
          </span>
        )}
      </button>
    </div>
  );
};

export default RoomAssistant;
