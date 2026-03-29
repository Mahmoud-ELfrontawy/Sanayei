import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";
import { useNotifications } from "./NotificationContext";
import { getActiveServiceRequest } from "../Api/serviceRequest/serviceRequests.api";
import { getActiveCommunityChat } from "../Api/community.api";
import { normalizeRole } from "./notification/notification.utils";

/* ================= Types ================= */

export interface ChatContact {
    id: number;
    name: string;
    type: string;
    avatar?: string;
    unread_count: number;
    isCommunityChat?: boolean; // فتح/غلق الشات بناءً على طلبات المجتمع
}

export interface ChatMessage {
    id: number;
    sender_id: number;
    sender_type: "user" | "worker" | "company";
    receiver_id: number;
    receiver_type: "user" | "worker" | "company";
    message?: string;
    created_at: string;
    is_read?: boolean;
    message_type?: "text" | "image" | "audio";
    media_path?: string | null;
    is_mine?: boolean;
}



interface Ctx {
    contacts: ChatContact[];
    activeChat: ChatContact | null;
    messages: ChatMessage[];
    canSendMessage: boolean;
    setActiveChat: (contact: ChatContact | null) => void;
    sendMessage: (text: string) => Promise<void>;
    sendImage: (file: File) => Promise<void>;
    sendAudio: (blob: Blob) => Promise<void>;
}

/* ================= Context ================= */

const Context = createContext<Ctx | null>(null);

export const UserChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userType } = useAuth();
    const qc = useQueryClient();
    const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
    const [canSendMessage, setCanSendMessage] = useState(true);
    const prevTotalUnreadRef = useRef<number>(0);

    /* ================= Contacts ================= */

    const contactsQuery = useQuery({
        queryKey: ["user-chats", user?.id],
        enabled: !!user?.id && (userType === "user" || userType === "company"),
        refetchInterval: 30000,
        queryFn: async (): Promise<ChatContact[]> => {
            const res = await chatApi.getUserChats(user!.id, userType!);
            const data = res.data || [];

            return data.map((c: any) => ({
                id: c.id,
                name: c.name,
                type: normalizeRole(c.type || "worker"),
                avatar: getFullImageUrl(c.profile_photo ?? undefined),
                unread_count: Number(c.unread_count ?? 0),
            }));
        },
    });

    const { addNotification, markTypeAsRead } = useNotifications();

    // Polling notifications
    useEffect(() => {
        if (!contactsQuery.data) return;
        const currentTotal = contactsQuery.data.reduce((sum, c) => sum + c.unread_count, 0);
        
        if (currentTotal > prevTotalUnreadRef.current) {
            const diffContact = contactsQuery.data.find(c => c.unread_count > 0);
            
            // Update ref before triggering notification
            prevTotalUnreadRef.current = currentTotal;

            addNotification({
                title: "رسالة جديدة",
                message: diffContact ? `رسالة جديدة من ${diffContact.name}` : "لديك رسائل جديدة",
                type: "chat",
                orderId: diffContact?.id || 0,
                recipientId: user!.id,
                recipientType: userType as any,
                eventId: `chat_total_${user!.id}_${currentTotal}`,
            });
        } else {
            prevTotalUnreadRef.current = currentTotal;
        }
    }, [contactsQuery.data, user?.id]);

    const messagesQuery = useQuery({
        queryKey: ["user-messages", activeChat?.id, user?.id],
        enabled: !!activeChat && !!user?.id && (userType === "user" || userType === "company"),
        refetchInterval: 10000,
        queryFn: async (): Promise<ChatMessage[]> => {
            const res = await chatApi.getMessages(user!.id, activeChat!.id, userType!);
            // Handle both {messages: []} and {data: {data: []}} structures
            const raw = res.messages || (Array.isArray(res.data) ? res.data : res.data?.data) || [];

            return raw.map((m: any) => ({
                ...m,
                is_mine: (Number(m.sender_id) === Number(user!.id) && normalizeRole(m.sender_type) === normalizeRole(userType!)),
            }));
        },
    });

    /* ================= Send Mutations ================= */

    const sendTextMutation = useMutation({
        mutationFn: async (text: string) => {
            await chatApi.sendChatMessage(user!.id, userType!, activeChat!.id, activeChat!.type, text);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
            qc.invalidateQueries({ queryKey: ["user-chats", user?.id] });
        },
    });

    const sendImageMutation = useMutation({
        mutationFn: async (file: File) => {
            await chatApi.sendChatImage(user!.id, userType!, activeChat!.id, activeChat!.type, file);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
            qc.invalidateQueries({ queryKey: ["user-chats", user?.id] });
        },
    });

    const sendAudioMutation = useMutation({
        mutationFn: async (blob: Blob) => {
            await chatApi.sendChatAudio(user!.id, userType!, activeChat!.id, activeChat!.type, blob);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["user-messages", activeChat?.id, user?.id] });
            qc.invalidateQueries({ queryKey: ["user-chats", user?.id] });
        },
    });

    /* ================= Chat Access Check ================= */

    useEffect(() => {
        if (!activeChat || !user?.id) {
            setCanSendMessage(true);
            return;
        }

        const check = async () => {
            try {
                // التحقق الموحد لليوزر والشركة: مجتمع + طلبات خدمة
                const [communityResult, serviceResult] = await Promise.allSettled([
                    getActiveCommunityChat(activeChat.id, userType as any),
                    getActiveServiceRequest(userType as any, activeChat.id),
                ]);
                
                const communityStatus = communityResult.status === 'fulfilled' ? communityResult.value.status : null;
                const serviceStatus = serviceResult.status === 'fulfilled' ? serviceResult.value.status : null;
                
                setCanSendMessage(communityStatus === 'in_progress' || serviceStatus === 'accepted');
            } catch {
                setCanSendMessage(false);
            }
        };

        check();
        const interval = setInterval(check, 10_000);
        return () => clearInterval(interval);
    }, [activeChat?.id, user?.id, userType]);

    /* ================= Mark As Read ================= */

    useEffect(() => {
        if (!activeChat || !user?.id) return;
        markTypeAsRead("chat");
        qc.setQueryData(["user-chats", user.id], (old: ChatContact[] | undefined) => {
            if (!old) return old;
            return old.map((c) => c.id === activeChat.id ? { ...c, unread_count: 0 } : c);
        });
        chatApi.markMessagesAsRead(user.id, userType!).catch(() => {
            qc.invalidateQueries({ queryKey: ["user-chats", user.id] });
        });
    }, [activeChat, user?.id, userType, qc, markTypeAsRead]);

    /* ================= Context Value ================= */

    const value: Ctx = {
        contacts: contactsQuery.data ?? [],
        activeChat,
        messages: messagesQuery.data ?? [],
        canSendMessage,
        setActiveChat,
        sendMessage: async (t) => {
            try {
                await sendTextMutation.mutateAsync(t);
            } catch (err: any) {
                if (err?.response?.status === 403) setCanSendMessage(false);
                throw err;
            }
        },
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