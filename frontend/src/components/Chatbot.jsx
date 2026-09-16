import { useState } from "react";
import { sendMessageToBot } from "../services/chatbotService";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I'm your AI Assistant. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const question = input;

    // User message
    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Backend response
      const answer = await sendMessageToBot(question);

      const botMessage = {
        sender: "bot",
        text: answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I couldn't process your request. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {/* AI Chatbot Floating Button */}
<button
  onClick={() => setIsOpen(!isOpen)}
  aria-label="Open AI Assistant"
  className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center
             bg-gradient-to-br from-violet-500 via-blue-500 to-teal-400
             text-white shadow-[0_0_20px_rgba(96,165,250,0.45)]
             border border-white/20
             hover:scale-110 hover:shadow-[0_0_30px_rgba(155,140,255,0.6)]
             transition-all duration-300 z-50"
>
  {/* AI Neural Spark Icon */}
  <span className="relative flex items-center justify-center">
    <span className="absolute w-7 h-7 rounded-full border border-white/30 animate-ping opacity-30" />

    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative"
    >
      {/* AI Brain */}
      <path
        d="M9 3.5C7.34 3.5 6 4.84 6 6.5C4.9 6.5 4 7.4 4 8.5C4 9.16 4.32 9.75 4.81 10.13C3.72 10.57 3 11.63 3 12.85C3 14.45 4.3 15.75 5.9 15.75C5.93 17.27 7.17 18.5 8.7 18.5C9.32 18.5 9.9 18.3 10.36 17.96C10.82 19.45 12.2 20.5 13.83 20.5C15.85 20.5 17.5 18.85 17.5 16.83V15.75C19.43 15.75 21 14.18 21 12.25C21 11.03 20.28 9.97 19.19 9.53C19.68 9.15 20 8.56 20 7.9C20 6.8 19.1 5.9 18 5.9C18 4.57 16.93 3.5 15.6 3.5C14.63 3.5 13.79 4.07 13.4 4.9C12.99 4.04 12.11 3.5 11.1 3.5H9Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neural Connections */}
      <path
        d="M8 8.5L11 10.5L13 8.5L16 10.5"
        stroke="#C4B5FD"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      <path
        d="M11 10.5V14.5L14 16"
        stroke="#67E8F9"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* AI Nodes */}
      <circle cx="8" cy="8.5" r="1.2" fill="#67E8F9" />
      <circle cx="11" cy="10.5" r="1.2" fill="#C4B5FD" />
      <circle cx="13" cy="8.5" r="1.2" fill="#67E8F9" />
      <circle cx="16" cy="10.5" r="1.2" fill="#C4B5FD" />
      <circle cx="11" cy="14.5" r="1.2" fill="#67E8F9" />
      <circle cx="14" cy="16" r="1.2" fill="#C4B5FD" />
    </svg>
  </span>
</button>

      {/* ========================================
          AI CHAT WINDOW
      ======================================== */}
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-6 z-50
            w-80
            overflow-hidden
            rounded-2xl
            border border-violet-400/20
            bg-slate-950/90
            backdrop-blur-xl
            shadow-[0_0_40px_rgba(96,165,250,0.15)]
          "
        >

          {/* ========================================
              AI HEADER
          ======================================== */}
          <div
            className="
              relative
              p-4
              border-b border-white/10
              bg-gradient-to-r
              from-violet-500/10
              via-blue-500/10
              to-teal-400/10
            "
          >
            <div className="flex items-center gap-3">

              {/* AI Avatar */}
              <div
                className="
                  w-9 h-9
                  rounded-full
                  flex items-center justify-center
                  text-sm
                  text-white
                  bg-gradient-to-br
                  from-violet-500
                  via-blue-500
                  to-teal-400
                  shadow-[0_0_15px_rgba(96,165,250,0.35)]
                "
              >
                ✦
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    AI Assistant
                  </h3>

                  <span className="ai-badge">
                    AI
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />

                  <span className="text-[10px] text-slate-400">
                    AI communication network online
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================
              MESSAGES
          ======================================== */}
          <div
            className="
              h-80
              overflow-y-auto
              p-4
              space-y-3
              bg-gradient-to-b
              from-slate-950/40
              to-blue-950/20
            "
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`
                    p-3
                    rounded-xl
                    text-xs
                    leading-relaxed
                    max-w-[80%]
                    border
                    ${
                      msg.sender === "user"
                        ? `
                          bg-gradient-to-br
                          from-violet-500/90
                          to-blue-500/90
                          text-white
                          border-violet-300/20
                          shadow-[0_0_15px_rgba(155,140,255,0.12)]
                        `
                        : `
                          bg-slate-800/70
                          text-slate-200
                          border-blue-400/10
                          backdrop-blur-sm
                        `
                    }
                  `}
                >
                  {msg.text}
                </div>

              </div>
            ))}
          </div>

          {/* ========================================
              INPUT AREA
          ======================================== */}
          <div
            className="
              flex
              gap-2
              p-3
              border-t border-white/10
              bg-slate-950/80
            "
          >
            <input
              type="text"
              placeholder="Ask your AI assistant..."
              className="
                flex-1
                min-w-0
                bg-slate-900/70
                border border-violet-400/10
                rounded-lg
                px-3
                py-2
                text-xs
                text-white
                placeholder:text-slate-500
                outline-none
                focus:border-violet-400/40
                focus:ring-1
                focus:ring-violet-400/20
                transition
              "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
  onClick={sendMessage}
  aria-label="Send message"
  className="w-11 flex items-center justify-center
             bg-gradient-to-br from-violet-500 via-blue-500 to-teal-400
             text-white
             hover:brightness-110
             transition-all duration-300"
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 3L10.5 13.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 3L14.3 21L10.5 13.5L3 9.7L21 3Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>
          </div>

        </div>
      )}
    </>
  );
}