import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const AI_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["help", "assist", "support"],
    response:
      "I'm here to help! What would you like to know about this course? Ask me anything about the topics covered.",
  },
  {
    keywords: ["quiz", "test", "exam"],
    response:
      "Great question! Review the key concepts from the lesson before taking the quiz. Focus on the definitions and core principles covered in the video.",
  },
  {
    keywords: ["certificate", "completion", "badge"],
    response:
      "You'll receive a completion certificate after finishing all lessons in the course. It'll be available for download from your dashboard.",
  },
  {
    keywords: ["stuck", "confused", "don't understand", "unclear"],
    response:
      "No worries! Complex topics can take time. Try rewatching the relevant section at a slower speed. You can also check the lesson description for additional resources.",
  },
  {
    keywords: ["project", "practice", "exercise"],
    response:
      "Hands-on practice is the best way to learn! Try building a small project using the concepts from this lesson. Start simple and gradually add complexity.",
  },
  {
    keywords: ["resource", "material", "pdf", "download"],
    response:
      "Check the lesson's PDF tab for downloadable materials and resources. You can also find supplementary reading in the Overview section.",
  },
  {
    keywords: ["time", "duration", "long", "complete"],
    response:
      "The course duration varies by lesson. You can track your progress using the progress bar at the top of the player. Set a daily learning goal to stay on track!",
  },
];

function getAIResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const item of AI_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return "That's a great question! The concepts covered in this lesson build the foundation for more advanced topics ahead. Keep learning and feel free to ask anything else.";
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your AI learning assistant. Ask me anything about this course!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1000));
    setIsTyping(false);

    const response = getAIResponse(text);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", text: response },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div
          className="w-80 rounded-2xl border border-border bg-background shadow-xl flex flex-col overflow-hidden animate-fade-in"
          data-ocid="ai.panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">
                AI Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              data-ocid="ai.close_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 h-72">
            <div className="flex flex-col gap-3 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot"
                        style={{ animationDelay: `${i * 0.16}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="text-xs h-8"
              data-ocid="ai.input"
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              data-ocid="ai.submit_button"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Assistant"
        data-ocid="ai.button"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>
    </div>
  );
}
