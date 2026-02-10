import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";

/* ================= Types ================= */

export interface ChatContact {
    id: number;
    name: string;
    avatar?: string;
    unread_count: number;
}

export interface ChatMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    message?: string;
    created_at: string;
    is_read?: boolean;
    message_type?: "text" | "image" | "audio";
    media_path?: string | null;
    is_mine?: boolean;
}

interface UserChatsResponse {
    data: Array<{
        id: number;
        name: string;
        profile_photo?: string | null;
        unread_count?: number | null;
    }>;
}

interface MessagesResponse {
    data: {
        data: ChatMessage[];
    };
}

interface Ctx {
    contacts: ChatContact[];
    activeChat: ChatContact | null;
    messages: ChatMessage[];
    setActiveChat: (contact: ChatContact) => void;
    sendMessage: (text: string) => Promise<void>;
    sendImage: (file: File) => Promise<void>;
    sendAudio: (blob: Blob) => Promise<void>;
}

/* ================= Context ================= */

const Context = createContext<Ctx | null>(null);

export const UserChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [activeChat, setActiveChat] = useState<ChatContact | null>(null);

    /* ================= Contacts ================= */

    const contactsQuery = useQuery({
        queryKey: ["user-chats", user?.id],
        enabled: !!user?.id,
        queryFn: async (): Promise<ChatContact[]> => {
            const res: UserChatsResponse = await chatApi.getUserChats(user!.id);

            return (res.data ?? []).map((c) => ({
                id: c.id,
                name: c.name,
                avatar: getFullImageUrl(c.profile_photo ?? undefined),
                unread_count: Number(c.unread_count ?? 0),
            }));
        },
    });

    /* ================= Messages ================= */

    const messagesQuery = useQuery({
        queryKey: ["user-messages", activeChat?.id, user?.id],
        enabled: !!activeChat && !!user?.id,
        queryFn: async (): Promise<ChatMessage[]> => {
            const res: MessagesResponse = await chatApi.getMessages(user!.id, activeChat!.id);
            const raw = res.data?.data ?? [];

            return raw.map((m) => ({
                ...m,
                is_mine: m.sender_id === user!.id,
            }));
        },
    });

    /* ================= Send Mutations ================= */

    const sendTextMutation = useMutation({
        mutationFn: async (text: string) => {
            await chatApi.sendChatMessage(user!.id, "user", activeChat!.id, "worker", text);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
            qc.invalidateQueries({ queryKey: ["user-chats", user?.id] });
        },
    });

    const sendImageMutation = useMutation({
        mutationFn: async (file: File) => {
            await chatApi.sendChatImage(user!.id, "user", activeChat!.id, "worker", file);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
        },
    });

    const sendAudioMutation = useMutation({
        mutationFn: async (blob: Blob) => {
            await chatApi.sendChatAudio(user!.id, "user", activeChat!.id, "worker", blob);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
        },
    });

    /* ================= Mark As Read ================= */

    useEffect(() => {
        if (!activeChat || !user?.id) return;

        qc.setQueryData(["user-chats", user.id], (old: ChatContact[] | undefined) => {
            if (!old) return old;
            return old.map((c) =>
                c.id === activeChat.id ? { ...c, unread_count: 0 } : c
            );
        });

        chatApi.markMessagesAsRead(user.id, activeChat.id, "user").catch(() => {
            qc.invalidateQueries({ queryKey: ["user-chats", user.id] });
        });
    }, [activeChat, user?.id, qc]);

    /* ================= Context Value ================= */

    const value: Ctx = {
        contacts: contactsQuery.data ?? [],
        activeChat,
        messages: messagesQuery.data ?? [],
        setActiveChat,
        sendMessage: async (t) => sendTextMutation.mutateAsync(t),
        sendImage: async (f) => sendImageMutation.mutateAsync(f),
        sendAudio: async (b) => sendAudioMutation.mutateAsync(b),
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useUserChat = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useUserChat must be used inside provider");
    return ctx;
};