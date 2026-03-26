import { useEffect, useRef, useState } from "react";
import { BrainCircuit, Trash2, X, ArrowUp, Wrench, MessageCircle } from "lucide-react";
import { useChat } from "@/app/hooks/useChat";
import { useLanguage } from "@/app/hooks/useLanguage";

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ToolMessageProps {
    toolName: string;
    content: string;
    label: string;
}

function ToolMessage({ toolName, content, label }: ToolMessageProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="my-1 cursor-pointer rounded-lg border border-slate-700 bg-slate-850 p-2 text-xs"
            style={{ backgroundColor: "#1a2744" }}
            onClick={() => setExpanded(prev => !prev)}
        >
            <div className="flex items-center gap-2">
                <Wrench size={12} className="text-slate-400 flex-shrink-0" />
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {label}: {toolName}
                </span>
            </div>
            <p
                className={`mt-1.5 text-slate-500 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
            >
                {content}
            </p>
        </div>
    );
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
    const { t, locale } = useLanguage();
    const { messages, isLoading, sendMessage, clearHistory, loadHistory } = useChat();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasLoadedRef = useRef(false);

    // Load history once when panel first opens
    useEffect(() => {
        if (isOpen && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadHistory();
        }
    }, [isOpen, loadHistory]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = 72; // ~3 rows
            textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px";
        }
    }, [inputValue]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text || isLoading) return;
        setInputValue("");
        sendMessage(text, locale);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestion = (text: string) => {
        sendMessage(text, locale);
    };

    const suggestions = [
        t("chat_suggestion_alerts"),
        t("chat_suggestion_scan"),
        t("chat_suggestion_stats"),
        t("chat_suggestion_inspection"),
    ];

    return (
        <div
            className={`fixed right-0 top-14 bottom-0 z-40 flex w-96 flex-col border-l border-slate-700 bg-slate-900 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-700 px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <BrainCircuit size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 leading-tight">
                        {t("chat_title")}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                        {t("chat_subtitle")}
                    </p>
                </div>
                <button
                    onClick={clearHistory}
                    title={t("chat_clear")}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                >
                    <Trash2 size={14} />
                </button>
                <button
                    onClick={onClose}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 && !isLoading ? (
                    /* Empty state */
                    <div className="flex h-full flex-col items-center justify-center gap-4 px-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
                            <MessageCircle size={24} className="text-blue-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-200">
                                {t("chat_welcome")}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {t("chat_welcome_help")}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSuggestion(suggestion)}
                                    className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-slate-700 hover:text-slate-200"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Message list */
                    <div className="flex flex-col gap-3">
                        {messages.map((msg) => {
                            if (msg.role === "tool") {
                                return (
                                    <ToolMessage
                                        key={msg.id}
                                        toolName={msg.toolName ?? "unknown"}
                                        content={msg.content}
                                        label={t("chat_tool_call")}
                                    />
                                );
                            }

                            if (msg.role === "user") {
                                return (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="ml-12 rounded-2xl rounded-br-sm bg-blue-600 p-3 text-sm text-white">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            }

                            // assistant
                            return (
                                <div key={msg.id} className="flex justify-start">
                                    <div className="mr-12 rounded-2xl rounded-bl-sm bg-slate-800 p-3 text-sm text-slate-200">
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="mr-12 flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3">
                                    <span className="text-xs text-slate-500">{t("chat_thinking")}</span>
                                    <span
                                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                                        style={{ animation: "chatPulse 1.2s ease-in-out infinite 0ms" }}
                                    />
                                    <span
                                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                                        style={{ animation: "chatPulse 1.2s ease-in-out infinite 200ms" }}
                                    />
                                    <span
                                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                                        style={{ animation: "chatPulse 1.2s ease-in-out infinite 400ms" }}
                                    />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-slate-700 bg-slate-950 p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("chat_placeholder")}
                        rows={1}
                        disabled={isLoading}
                        className="flex-1 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-0 disabled:opacity-50"
                        style={{ minHeight: "36px", maxHeight: "72px" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>

            {/* Keyframe styles injected inline */}
            <style>{`
                @keyframes chatPulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
