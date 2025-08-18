import React, { useState } from "react";

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5203/api/chat/stream", {
                // Yeni endpoint: stream için ayrı route kullanacağız
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!response.body) {
                throw new Error("Streaming desteklenmiyor");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let botMessage = { sender: "bot", text: "" };
            setMessages((prev) => [...prev, botMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // Backend'ten gelen satırları ayır
                const lines = chunk.split("\n").filter((line) => line.trim() !== "");

                for (let line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            botMessage.text += json.response;
                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { ...botMessage };
                                return updated;
                            });
                        }
                    } catch (err) {
                        console.error("JSON parse hatası:", err);
                    }
                }
            }
        } catch (error) {
            console.error("Hata:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "Bir hata oluştu." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
            {isOpen && (
                <div
                    style={{
                        width: "300px",
                        height: "400px",
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        marginBottom: "10px"
                    }}
                >
                    <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    textAlign: msg.sender === "user" ? "right" : "left",
                                    margin: "5px 0"
                                }}
                            >
                                <b>{msg.sender}:</b> {msg.text}
                            </div>
                        ))}
                        {isLoading && <div style={{ fontStyle: "italic" }}>Yazıyor...</div>}
                    </div>
                    <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Mesaj yaz..."
                            style={{ flex: 1, padding: "5px", border: "none" }}
                        />
                        <button
                            onClick={sendMessage}
                            style={{
                                padding: "5px 10px",
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Gönder
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    cursor: "pointer",
                    fontSize: "24px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }}
            >
                💬
            </button>
        </div>
    );
}

export default Chatbot;