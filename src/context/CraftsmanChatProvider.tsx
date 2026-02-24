import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";
import { normalizeArray } from "../utils/normalizeResponse";
import { useNotifications } from "./NotificationContext";

/* ===================================================== */
/* ======================= TYPES ======================= */
/* ===================================================== */

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

interface MessagesResponse {
  data: {
    data: ChatMessage[];
  };
}

interface WorkerChatsResponseItem {
  id: number;
  name: string;
  profile_photo?: string | null;
  profile_image?: string | null;
  unread_count?: number | null;
}

/* ===================================================== */
/* ======================= CONTEXT ===================== */
/* ===================================================== */

interface Ctx {
  contacts: ChatContact[];
  activeChat: ChatContact | null;
  messages: ChatMessage[];
  setActiveChat: (contact: ChatContact | null) => void;
  sendMessage: (text: string) => Promise<void>;
  sendImage: (file: File) => Promise<void>;
  sendAudio: (blob: Blob) => Promise<void>;
}

const Context = createContext<Ctx | null>(null);

/* ===================================================== */
/* ================= CRAFTSMAN PROVIDER ================= */
/* ===================================================== */

export const CraftsmanChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userType } = useAuth();
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const prevTotalUnreadRef = useRef<number>(0);

  const contactsQuery = useQuery({
    queryKey: ["worker-chats", user?.id],
    enabled: !!user?.id && userType === "craftsman",
    refetchInterval: 30000,
    queryFn: async (): Promise<ChatContact[]> => {
      const res = await chatApi.getWorkerChats(user!.id);
      const arr = normalizeArray(res) as WorkerChatsResponseItem[];

      return arr.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: getFullImageUrl(c.profile_photo ?? c.profile_image ?? undefined),
        unread_count: Number(c.unread_count ?? 0),
      }));
    },
  });

  const { addNotification, markTypeAsRead } = useNotifications();

  // Fallback: Watch for unread count changes in polling
  useEffect(() => {
    if (!contactsQuery.data) return;

    const currentTotal = contactsQuery.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    if (currentTotal > prevTotalUnreadRef.current) {
      console.log(`🕵️ [Craftsman] Polling detected ${currentTotal - prevTotalUnreadRef.current} new message(s)`);

      const diffContact = contactsQuery.data.find(c => c.unread_count > 0);

      addNotification({
        title: "رسالة جديدة",
        message: diffContact ? `رسالة جديدة من ${diffContact.name}` : "لديك رسائل جديدة",
        type: "chat",
        orderId: diffContact?.id || 0,
        recipientId: user!.id,
        recipientType: "craftsman",
      });
    }

    prevTotalUnreadRef.current = currentTotal;
  }, [contactsQuery.data, addNotification, user?.id]);

  const messagesQuery = useQuery({
    queryKey: ["worker-messages", activeChat?.id, user?.id],
    enabled: !!activeChat && !!user?.id && userType === "craftsman",
    refetchInterval: 20000,
    queryFn: async (): Promise<ChatMessage[]> => {
      const res: MessagesResponse = await chatApi.getMessages(activeChat!.id, user!.id);
      const raw = res.data?.data ?? [];

      return raw.map((m: any) => ({ ...m, is_mine: m.sender_id === user!.id }));
    },
  });

  const sendTextMutation = useMutation({
    mutationFn: async (text: string) => {
      await chatApi.sendChatMessage(user!.id, "worker", activeChat!.id, "user", text);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  const sendImageMutation = useMutation({
    mutationFn: async (file: File) => {
      await chatApi.sendChatImage(user!.id, "worker", activeChat!.id, "user", file);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  const sendAudioMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      await chatApi.sendChatAudio(user!.id, "worker", activeChat!.id, "user", blob);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  useEffect(() => {
    if (!activeChat || !user?.id) return;

    // Clear chat notifications when a chat is opened
    markTypeAsRead("chat");

    qc.setQueryData(["worker-chats", user.id], (old: ChatContact[] | undefined) => {
      if (!old) return old;
      return old.map((c) => (c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
    });

    chatApi.markMessagesAsRead(activeChat.id, user.id, "worker").catch(() => {
      qc.invalidateQueries({ queryKey: ["worker-chats", user.id] });
    });
  }, [activeChat, user?.id, qc, markTypeAsRead]);

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

/* ===================================================== */
/* ==================== CRAFTSMAN HOOK ================= */
/* ===================================================== */

export const useCraftsmanChat = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCraftsmanChat must be used inside CraftsmanChatProvider");
  return ctx;
};