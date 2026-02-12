import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";
import { normalizeArray } from "../utils/normalizeResponse";
import { getEcho } from "../utils/echo";

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
/* =================== USER PROVIDER =================== */
/* ===================================================== */

export const UserChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);

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

  const messagesQuery = useQuery({
    queryKey: ["user-messages", activeChat?.id, user?.id],
    enabled: !!activeChat && !!user?.id,
    queryFn: async (): Promise<ChatMessage[]> => {
      const res: MessagesResponse = await chatApi.getMessages(user!.id, activeChat!.id);
      const raw = res.data?.data ?? [];

      return raw.map((m) => ({ ...m, is_mine: m.sender_id === user!.id }));
    },
  });

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

  useEffect(() => {
    if (!activeChat || !user?.id) return;

    qc.setQueryData(["user-chats", user.id], (old: ChatContact[] | undefined) => {
      if (!old) return old;
      return old.map((c) => (c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
    });

    chatApi.markMessagesAsRead(user.id, activeChat.id, "user").catch(() => {
      qc.invalidateQueries({ queryKey: ["user-chats", user.id] });
    });
  }, [activeChat, user?.id, qc]);

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

/* ===================================================== */
/* ================= CRAFTSMAN PROVIDER ================= */
/* ===================================================== */

export const CraftsmanChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);

  const contactsQuery = useQuery({
    queryKey: ["worker-chats", user?.id],
    enabled: !!user?.id,
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

  const messagesQuery = useQuery({
    queryKey: ["worker-messages", activeChat?.id, user?.id],
    enabled: !!activeChat && !!user?.id,
    queryFn: async (): Promise<ChatMessage[]> => {
      const res = await chatApi.getMessages(activeChat!.id, user!.id);
      const raw = res.data?.data ?? [];

      return raw.map((m: any) => ({ ...m, is_mine: m.sender_id === user!.id }));
    },
  });

  const sendTextMutation = useMutation({
    mutationFn: async (text: string) => {
      await chatApi.sendChatMessage(user!.id, "worker", activeChat!.id, "user", text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
      qc.invalidateQueries({ queryKey: ["worker-chats", user?.id] });
    },
  });

  const sendImageMutation = useMutation({
    mutationFn: async (file: File) => {
      await chatApi.sendChatImage(user!.id, "worker", activeChat!.id, "user", file);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
    },
  });

  const sendAudioMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      await chatApi.sendChatAudio(user!.id, "worker", activeChat!.id, "user", blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat?.id, user?.id] });
    },
  });

  useEffect(() => {
    if (!activeChat || !user?.id) return;

    qc.setQueryData(["worker-chats", user.id], (old: ChatContact[] | undefined) => {
      if (!old) return old;
      return old.map((c) => (c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
    });

    chatApi.markMessagesAsRead(activeChat.id, user.id, "worker").catch(() => {
      qc.invalidateQueries({ queryKey: ["worker-chats", user.id] });
    });
  }, [activeChat, user?.id, qc]);

  /* ================= Real-time Updates ================= */

  useEffect(() => {
    if (!user?.id || !activeChat?.id) return;

    const echo = getEcho();
    if (!echo) return;

    // Listen on public channel: chat.{sender}.{receiver}
    // We need to listen on both directions
    const channel1 = echo.channel(`chat.${user.id}.${activeChat.id}`);
    const channel2 = echo.channel(`chat.${activeChat.id}.${user.id}`);

    const handleMessage = (event: any) => {
      console.log('📨 New message received (Worker):', event);

      // Refresh messages in current chat
      qc.invalidateQueries({ queryKey: ["worker-messages", activeChat.id, user.id] });

      // Refresh chat list to update unread counts
      qc.invalidateQueries({ queryKey: ["worker-chats", user.id] });
    };

    channel1.listen('.message.sent', handleMessage);
    channel2.listen('.message.sent', handleMessage);

    return () => {
      channel1.stopListening('.message.sent');
      channel2.stopListening('.message.sent');
    };
  }, [user?.id, activeChat?.id, qc]);

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