import { useEffect, useRef } from "react";
import TrainingMessage from "./TrainingMessage";

export default function TrainingChatWindow({ messages, isTyping }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  return (
    <section className="agent-training-chat-window">
      <header className="agent-training-chat-window__header">
        <div className="agent-training-chat-window__status" />

        <span>Training Studio IA</span>
      </header>

      <div className="agent-training-chat-window__messages">
        {messages.map((message) => (
          <TrainingMessage
            key={message.id}
            role={message.role}
          >
            {message.content}
          </TrainingMessage>
        ))}

        {isTyping && (
          <div className="training-message">
            <div className="training-message__avatar">IA</div>

            <div className="training-typing">
              <div className="training-typing__dot"></div>
              <div className="training-typing__dot"></div>
              <div className="training-typing__dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div></section>
  );
}
