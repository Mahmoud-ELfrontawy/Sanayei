import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";
import { normalizeArray } from "../utils/normalizeResponse";
import { useNotifications } from "./NotificationContext";
import { getActiveServiceRequest } from "../Api/serviceRequest/serviceRequests.api";
import { getActiveCommunityChat } from "../Api/community.api";
import { normalizeRole } from "./notification/notification.utils";

/* ===================================================== */
/* ======================= TYPES ======================= */
/* ===================================================== */

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



/* ===================================================== */
/* ======================= CONTEXT ===================== */
/* ===================================================== */

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

const Context = createContext<Ctx | null>(null);

/* ===================================================== */
/* ================= CRAFTSMAN PROVIDER ================= */
/* ===================================================== */

export const CraftsmanChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userType } = useAuth();
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const prevTotalUnreadRef = useRef<number>(0);

  const contactsQuery = useQuery({
    queryKey: ["worker-chats", user?.id],
    enabled: !!user?.id && userType === "craftsman",
    refetchInterval: 30000,
    queryFn: async (): Promise<ChatContact[]> => {
      const res = await chatApi.getWorkerChats(user!.id);
      const arr = normalizeArray(res);

      return (arr || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: normalizeRole(c.type || "user"),
        avatar: getFullImageUrl(c.profile_photo ?? c.profile_image ?? undefined),
        unread_count: Number(c.unread_count ?? 0),
      }));
    },
  });

  const { addNotification, markTypeAsRead } = useNotifications();

  // Polling notifications
  useEffect(() => {
    if (!contactsQuery.data) return;
    const currentTotal = contactsQuery.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    if (currentTotal > prevTotalUnreadRef.current) {
      const diffContact = contactsQuery.data.find(c => c.unread_count > 0);

      if (diffContact) {
        addNotification({
          title: "رسالة جديدة",
          message: `رسالة جديدة من ${diffContact.name}`,
          type: "chat",
          orderId: diffContact.id,
          recipientId: user!.id,
          recipientType: "craftsman",
        });
      }
    }
    prevTotalUnreadRef.current = currentTotal;
  }, [contactsQuery.data, addNotification, user?.id]);

  const messagesQuery = useQuery({
    queryKey: ["worker-messages", activeChat?.id, user?.id],
    enabled: !!activeChat && !!user?.id && userType === "craftsman",
    refetchInterval: 10000,
    queryFn: async (): Promise<ChatMessage[]> => {
      const res = await chatApi.getMessages(activeChat!.id, user!.id, activeChat!.type);
      // Handle both {messages: []} and {data: {data: []}} structures
      const raw = res.messages || (Array.isArray(res.data) ? res.data : res.data?.data) || [];

      return raw.map((m: any) => ({
        ...m,
        is_mine: (Number(m.sender_id) === Number(user!.id) && normalizeRole(m.sender_type) === "craftsman")
      }));
    },
  });

  const sendTextMutation = useMutation({
    mutationFn: async (text: string) => {
      await chatApi.sendChatMessage(user!.id, "craftsman", activeChat!.id, activeChat!.type, text);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  const sendImageMutation = useMutation({
    mutationFn: async (file: File) => {
      await chatApi.sendChatImage(user!.id, "craftsman", activeChat!.id, activeChat!.type, file);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  const sendAudioMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      await chatApi.sendChatAudio(user!.id, "craftsman", activeChat!.id, activeChat!.type, blob);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  /* ================= Chat Access Check ================= */

  useEffect(() => {
    if (!activeChat || !user?.id) {
      setCanSendMessage(true);
      return;
    }
    const check = async () => {
      if (activeChat.isCommunityChat) {
        // ✔ نظام المجتمع: الشات يفتح فقط لما in_progress
        const { status } = await getActiveCommunityChat(activeChat.id);
        setCanSendMessage(status === 'in_progress');
      } else {
        // نظام الخدمات العادية
        getActiveServiceRequest('craftsman', activeChat.id)
          .then(({ status }) => { setCanSendMessage(status === 'accepted'); })
          .catch(() => {});
      }
    };
    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [activeChat?.id, activeChat?.isCommunityChat, user?.id]);

  useEffect(() => {
    if (!activeChat || !user?.id) return;
    markTypeAsRead("chat");
    qc.setQueryData(["worker-chats", user.id], (old: ChatContact[] | undefined) => {
      if (!old) return old;
      return old.map((c) => (c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
    });
    chatApi.markMessagesAsRead(user.id, "craftsman").catch(() => {
      qc.invalidateQueries({ queryKey: ["worker-chats", user.id] });
    });
  }, [activeChat, user?.id, qc, markTypeAsRead]);

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

export const useCraftsmanChat = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCraftsmanChat must be used inside CraftsmanChatProvider");
  return ctx;
};