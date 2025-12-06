import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryCourse } from "../services/chatService";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Fetch course
  async function getResponse(query) {
    setLoading(true);

    try {
      const response = await queryCourse(query);

      if (!response) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            type: "text",
            text: "Sorry, no suitable course found.",
          },
        ]);
        setLoading(false);
        return;
      }

      const card = {
        sender: "bot",
        type: "course",
        id: response.id,
        title: response.title || response.title_ar || "Untitled",
        description: response.description || "",
        thumbnail:
          response.thumbnail || response.image || response.thumbnailUrl || "",
        price: response.price,
        studentsCount: response.studentsCount,
        avgCompletion: response.avgCompletion,
        avgSatisfaction: response.avgSatisfaction,
        raw: response,
        courseUrl: `/courses/${response.id}`,
      };
      console.log("Fetched course:", card);

      setMessages((prev) => [...prev, card]);
    } catch (err) {
      console.error("queryCourse error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          text: "Something went wrong while fetching the course.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Send message
  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg = {
      sender: "user",
      type: "text",
      text: message.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    getResponse(message.trim());
    setMessage("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 bg-[var(--primary)] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold hover:opacity-90 transition"
      >
        💬
      </button>

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-[var(--primary)] text-white rounded-t-2xl">
            <span className="font-medium">AI Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="p-4 h-64 overflow-y-auto text-[var(--foreground)] space-y-3"
          >
            {/* Default greeting */}
            <div className="bg-[var(--secondary)] p-2 rounded-lg inline-block">
              Hi! How can I help you today?
            </div>

            {messages.map((msg, i) => {
              // User bubble
              if (msg.type === "text" && msg.sender === "user") {
                return (
                  <div className="flex justify-end" key={i}>
                    <div className="max-w-[80%] bg-[var(--primary)] text-white p-2 rounded-lg rounded-br-none">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              // Bot text
              if (msg.type === "text" && msg.sender === "bot") {
                return (
                  <div className="flex justify-start" key={i}>
                    <div className="max-w-[80%] bg-[var(--secondary)] p-2 text-black rounded-lg rounded-bl-none">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              // Bot course card
              if (msg.type === "course") {
                return (
                  <div className="flex justify-start w-full" key={i}>
                    <div className="max-w-[80%] bg-white rounded-lg shadow p-2 border border-gray-200">
                      {/* Thumbnail */}
                      <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={msg.thumbnail}
                          alt={msg.title}
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-image.png";
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Text */}
                      <div className="mt-2">
                        <div className="font-semibold text-gray-800 text-sm">
                          {msg.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-3">
                          {msg.description}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
                          <span>
                            {msg.studentsCount
                              ? `${msg.studentsCount} students`
                              : ""}
                          </span>
                          <span>
                            {typeof msg.price !== "undefined"
                              ? `$${msg.price}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(msg.courseUrl)}
                          className="flex-1 bg-[var(--primary)] text-white py-2 rounded-md text-sm hover:opacity-90 transition"
                        >
                          View Course
                        </button>

                        <a
                          href={msg.thumbnail}
                          target="_blank"
                          className="px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Image
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Typing Loader */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="bg-[var(--secondary)] text-black p-2 rounded-lg inline-flex">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce ml-1"
                    style={{ animationDelay: "0.12s" }}
                  />
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce ml-1"
                    style={{ animationDelay: "0.24s" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex border-t border-[var(--border)]">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-3 bg-[var(--input-background)] outline-none rounded-bl-2xl"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button
              onClick={handleSend}
              className="px-4 bg-[var(--primary)] text-white rounded-br-2xl"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
