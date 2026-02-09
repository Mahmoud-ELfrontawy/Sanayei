import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";

export interface ChatContact {
    last_message?: any;
    id: number;
    name: string;
    avatar?: string;
    unread_count: number;
}

interface ChatMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
    is_read: boolean;

    message_type?: "text" | "image" | "audio";
    media_path?: string | null;

    is_mine?: boolean;
}


interface Ctx {
    contacts: ChatContact[];
    activeChat: ChatContact | null;
    messages: ChatMessage[];
    setActiveChat: (contact: ChatContact) => void;
    sendMessage: (text: string) => Promise<void>;
}

const Context = createContext<Ctx | null>(null);

export const UserChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [activeChat, setActiveChat] = useState<ChatContact | null>(null);


    const contactsQuery = useQuery({
        queryKey: ["user-chats", user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            const res = await chatApi.getUserChats(user!.id);
            return (res.data ?? []).map((c: any) => ({
                id: c.id,
                name: c.name,
                avatar: getFullImageUrl(c.profile_photo),
                unread_count: Number(c.unread_count || 0),
            }));
        },
    });


    const messagesQuery = useQuery({
        queryKey: ["user-messages", activeChat?.id, user?.id],
        enabled: !!activeChat && !!user?.id,
        queryFn: async () => {
            const res = await chatApi.getMessages(user!.id, activeChat!.id);
            const raw = res.data?.data ?? [];
            return raw.map((m: any) => ({
                ...m,
                is_mine: m.sender_id === user!.id,
            }));
        },
    });


    const sendMutation = useMutation({
        mutationFn: async (text: string) => {
            await chatApi.sendChatMessage(user!.id, "user", activeChat!.id, "worker", text);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["user-messages"] });
            qc.invalidateQueries({ queryKey: ["user-chats"] });
        },
    });


    useEffect(() => {
        if (!activeChat || !user?.id) return;

        // ===== Optimistic Update =====
        qc.setQueryData(["user-chats", user.id], (old: any) => {
            if (!old) return old;

            return old.map((c: any) =>
                c.id === activeChat.id ? { ...c, unread_count: 0 } : c
            );
        });

        // ===== API Call =====
        chatApi.markMessagesAsRead(user.id, activeChat.id, "user")
            .catch(() => {
                // في حالة الفشل نرجّع الداتا من السيرفر
                qc.invalidateQueries({ queryKey: ["user-chats", user.id] });
            });

    }, [activeChat, user?.id, qc]);



    const value: Ctx = {
        contacts: contactsQuery.data ?? [],
        activeChat,
        messages: messagesQuery.data ?? [],
        setActiveChat,
        sendMessage: async (t) => sendMutation.mutateAsync(t),
    };


    return <Context.Provider value={value}>{children}</Context.Provider>;
};


export const useUserChat = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useUserChat must be used inside provider");
    return ctx;
};