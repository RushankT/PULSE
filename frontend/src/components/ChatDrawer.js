import { useState, useRef } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "What’s trending right now?",
  "Break down this insight for me",
  "What changed since the last refresh?",
  "Which trend is most actionable?"
];

export default function ChatDrawer({ country }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef([]);

  const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "https://pulse-asni.onrender.com").replace(/\/+$/, "");

  const handleSend = async (question) => {
    if (!question && !input) return;
    const q = question || input;
    setMessages((msgs) => [...msgs, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const apiUrl = BACKEND_URL + "/api/chat/insights";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          history: historyRef.current.map((m) => m.content),
          question: q
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", content: `Sorry, something went wrong. ${data.error}` }
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: data.answer,
            breakdown: data.breakdown,
            why: data.why_it_matters,
            confidence: data.confidence,
            sources: data.sources
          }
        ]);
      }
      historyRef.current.push({ role: "user", content: q });
      historyRef.current.push({ role: "assistant", content: data.answer });
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Sorry, something went wrong." }
      ]);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-2xl p-0 w-16 h-16 flex items-center justify-center border-4 border-primary/80 bg-gradient-to-br from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white transition-all duration-200"
          style={{ boxShadow: "0 8px 32px 0 rgba(60,72,180,0.25)" }}
          aria-label="Open chat"
        >
          <MessageSquare className="w-7 h-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-md w-full flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>PULSE Chat Assistant</SheetTitle>
        </SheetHeader>
        <div className="flex flex-row justify-end px-4 pt-2">
          <Button variant="outline" size="sm" onClick={() => { setMessages([]); historyRef.current = []; setInput(""); }}>New Chat</Button>
        </div>
        <div className="flex-1 flex flex-col gap-2 px-4 pb-4 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-sm mb-2">Try one of these prompts:</div>
          )}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <Button key={p} variant="secondary" size="sm" onClick={() => handleSend(p)}>{p}</Button>
              ))}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
              <div className={msg.role === "user" ? "inline-block bg-primary text-primary-foreground rounded-lg px-3 py-2 mb-1" : "inline-block bg-muted rounded-lg px-3 py-2 mb-1"}>
                {msg.content}
                {msg.role === "assistant" && msg.breakdown && (
                  <div className="text-xs mt-2 text-muted-foreground">{msg.breakdown}</div>
                )}
                {msg.role === "assistant" && msg.why && (
                  <div className="text-xs mt-1 text-muted-foreground italic">Why it matters: {msg.why}</div>
                )}
                {msg.role === "assistant" && msg.confidence !== undefined && (
                  <div className="text-xs mt-1 text-muted-foreground">Confidence: {(msg.confidence * 100).toFixed(0)}%</div>
                )}
                {msg.role === "assistant" && msg.sources && (
                  <div className="text-xs mt-1 text-muted-foreground">Sources: {msg.sources.join(", ")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          className="flex items-end gap-2 px-4 pb-4"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about trends, insights, or actions..."
            className="resize-y min-h-[40px] max-h-40 w-full overflow-auto text-base"
            style={{overflowY: 'auto'}}
            disabled={loading}
            rows={2}
            required
          />
          <Button type="submit" disabled={loading || !input} className="h-10 px-4">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send"}
          </Button>
        </form>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
