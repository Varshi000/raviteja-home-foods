import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiX, FiMinus, FiPlus, FiSend, FiLoader } from "react-icons/fi";
import { askQuestion } from "../services/api.js";
import "./ChatBot.css";

const CHAT_HISTORY_KEY = "chatbot_history_v1";
const CHAT_POSITION_KEY = "chatbot_position_v1";
const CHAT_MINIMIZED_KEY = "chatbot_minimized_v1";
const DEFAULT_MESSAGE = {
  id: "welcome-message",
  text: "Hi 👋 Welcome to Raviteja Home Foods! Ask me anything about delivery, products, orders or offers.",
  sender: "bot",
  timestamp: Date.now(),
};

const DEFAULT_MARGIN = 24;
const BUTTON_SIZE = 64;

const getBottomRightPosition = () => ({
  x: Math.max(window.innerWidth - BUTTON_SIZE - DEFAULT_MARGIN, DEFAULT_MARGIN),
  y: Math.max(window.innerHeight - BUTTON_SIZE - DEFAULT_MARGIN, DEFAULT_MARGIN),
});

const clampPosition = (pos) => {
  if (typeof window === "undefined") return pos;

  const maxX = Math.max(window.innerWidth - BUTTON_SIZE - DEFAULT_MARGIN, DEFAULT_MARGIN);
  const maxY = Math.max(window.innerHeight - BUTTON_SIZE - DEFAULT_MARGIN, DEFAULT_MARGIN);

  return {
    x: Math.min(Math.max(pos?.x ?? DEFAULT_MARGIN, DEFAULT_MARGIN), maxX),
    y: Math.min(Math.max(pos?.y ?? DEFAULT_MARGIN, DEFAULT_MARGIN), maxY),
  };
};

const getSavedPosition = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(CHAT_POSITION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed?.x == null || parsed?.y == null) return null;
    return parsed;
  } catch {
    return null;
  }
};

const getSavedMinimizedState = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CHAT_MINIMIZED_KEY) === "true";
};

const getInitialPosition = () => {
  if (typeof window === "undefined") return { x: DEFAULT_MARGIN, y: DEFAULT_MARGIN };
  return clampPosition(getSavedPosition() || getBottomRightPosition());
};

const getInitialOpenState = () => getSavedMinimizedState();
const getInitialMinimizedState = () => getSavedMinimizedState();

const getPanelHorizontalDirection = (pos) => {
  if (typeof window === "undefined") return "right";
  const panelWidth = Math.min(360, window.innerWidth - 24);
  return pos.x + panelWidth <= window.innerWidth ? "left" : "right";
};

function ChatBot() {
  const [open, setOpen] = useState(getInitialOpenState);
  const [minimized, setMinimized] = useState(getInitialMinimizedState);
  const [position, setPosition] = useState(getInitialPosition);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 520 : false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([DEFAULT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, pointerId: null });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_HISTORY_KEY);

    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (err) {
        console.warn("ChatBot: failed to parse saved chat history", err);
      }
    }

    const handleResize = () => {
      setPosition((current) => clampPosition(current));
      setIsMobile(window.innerWidth <= 520);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem(CHAT_MINIMIZED_KEY, minimized ? "true" : "false");
  }, [minimized]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, open, minimized]);

  const panelDirection = position.y < 240 ? "below" : "above";
  const panelHorizontal = getPanelHorizontalDirection(position);

  const handlePointerDown = (event) => {
    if (isMobile) return; // disable dragging on mobile — use fixed bottom-right
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (isMobile) return;
    if (!dragging || dragRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setPosition(clampPosition({
      x: dragRef.current.originX + deltaX,
      y: dragRef.current.originY + deltaY,
    }));
  };

  const handlePointerUp = (event) => {
    if (isMobile) return;
    if (!dragging || dragRef.current.pointerId !== event.pointerId) return;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_err) {
      // Ignore release capture errors
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = async (messageText) => {
    const trimmedText = messageText.trim();
    if (!trimmedText) {
      setError("Please type a message before sending.");
      return;
    }

    setError("");
    addMessage({ id: `user-${Date.now()}`, text: trimmedText, sender: "user", timestamp: Date.now() });
    setInput("");
    setIsTyping(true);
    setIsLoading(true);

    try {
      const payload = await askQuestion(trimmedText);
      const botText = payload?.response || payload?.query || "Sorry, I could not process your request right now.";
      addMessage({ id: `bot-${Date.now()}`, text: botText, sender: "bot", timestamp: Date.now() });
    } catch (err) {
      const friendly = err?.message || "Something went wrong. Please try again later.";
      setError(friendly);
      addMessage({
        id: `bot-error-${Date.now()}`,
        text: "The assistant is unavailable right now. Please try again in a moment.",
        sender: "bot",
        timestamp: Date.now(),
      });
      console.error("ChatBot API error:", err);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleToggle = () => {
    setOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setMinimized(false);
      }
      return nextOpen;
    });
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleMaximize = () => {
    setOpen(true);
    setMinimized(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  // If mobile, anchor to bottom-right to avoid keyboard/input overlap and dragging issues
  const widgetStyle = isMobile
    ? { right: DEFAULT_MARGIN, bottom: DEFAULT_MARGIN, left: 'auto', top: 'auto' }
    : { left: position.x, top: position.y };

  return (
    <div
      className={`chatbot-widget ${open ? "open" : ""} ${dragging ? "dragging" : ""} ${isMobile ? 'mobile' : ''}`}
      style={widgetStyle}
    >
      <button
        type="button"
        className={`chatbot-toggle ${open ? "chatbot-toggle-open" : ""}`}
        onClick={handleToggle}
        aria-label={open ? "Close chat" : "Open chat"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <FiMessageCircle />
      </button>

      {open && (
        <div className={`chatbot-panel ${panelDirection} ${panelHorizontal} ${minimized ? "minimized" : ""}`}>
          <div
            className="chatbot-header"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div>
              <strong>Raviteja Support</strong>
              <div className="chatbot-subtitle">AI assistant for orders, products, and delivery</div>
            </div>
            <div className="chatbot-actions">
              {minimized ? (
                <button
                  type="button"
                  className="chatbot-icon-btn"
                  onClick={handleMaximize}
                  onPointerDown={(event) => event.stopPropagation()}
                  title="Maximize chat"
                >
                  <FiPlus />
                </button>
              ) : (
                <button
                  type="button"
                  className="chatbot-icon-btn"
                  onClick={handleMinimize}
                  onPointerDown={(event) => event.stopPropagation()}
                  title="Minimize chat"
                >
                  <FiMinus />
                </button>
              )}
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={handleClose}
                onPointerDown={(event) => event.stopPropagation()}
                title="Close chat"
              >
                <FiX />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="chatbot-content">
              <div className="chatbot-body">
                {messages.map((message) => (
                  <div key={message.id} className={`chatbot-message ${message.sender}`}>
                    <span>{message.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chatbot-status-row">
                {isTyping && (
                  <div className="chatbot-status typing">
                    <FiLoader className="chatbot-spinner" /> Typing...
                  </div>
                )}
                {error && !isTyping && <div className="chatbot-status error">{error}</div>}
              </div>

              <form className="chatbot-input-row" onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  aria-label="Chat message"
                  disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message">
                  {isLoading ? <FiLoader className="chatbot-spinner" /> : <FiSend />}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatBot;
