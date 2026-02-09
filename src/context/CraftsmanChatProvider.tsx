import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chatApi from "../Api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { getFullImageUrl } from "../utils/imageUrl";
import { normalizeArray } from "../utils/normalizeResponse";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  message_type?: "text" | "image" | "audio";
  media_path?: string;
  is_mine?: boolean;
}

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  unread_count: number;
}

interface Ctx {
  contacts: Contact[];
  activeChat: Contact | null;
  messages: Message[];
  setActiveChat: (c: Contact | null) => void;
  sendMessage: (text: string) => Promise<void>;
}

const Context = createContext<Ctx | undefined>(undefined);

export const CraftsmanChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeChat, setActiveChat] = useState<Contact | null>(null);

  /** ===== Contacts ===== */
  const contactsQuery = useQuery({
    queryKey: ["worker-chats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await chatApi.getWorkerChats(user!.id);
      const arr = normalizeArray(res);

      console.log("WORKER CHATS:", arr);

      return arr.map((c: any) => ({
        id: c.id,
        name: c.name,
        avatar: getFullImageUrl(c.profile_photo || c.profile_image),
        unread_count: Number(c.unread_count || 0),
      }));
    },
  });

  /** ===== Messages ===== */
  const messagesQuery = useQuery({
    queryKey: ["worker-messages", activeChat?.id, user?.id],
    enabled: !!activeChat && !!user?.id,
    queryFn: async () => {
      const res = await chatApi.getMessages(activeChat!.id, user!.id);
      const raw = normalizeArray(res);

      return raw.map((m: any) => ({
        ...m,
        is_mine: m.sender_id === user!.id,
      }));
    },
  });

  /** ===== Send Message ===== */
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      await chatApi.sendChatMessage(user!.id, "worker", activeChat!.id, "user", text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["worker-messages"] });
      qc.invalidateQueries({ queryKey: ["worker-chats"] });
    },
  });

  /** ===== Mark as Read ===== */
  useEffect(() => {
    if (!activeChat || !user?.id) return;

    // Optimistic update
    qc.setQueryData(["worker-chats", user.id], (old: any) => {
      if (!old) return old;
      return old.map((c: any) =>
        c.id === activeChat.id ? { ...c, unread_count: 0 } : c
      );
    });

    // API call
    chatApi.markMessagesAsRead(activeChat.id, user.id, "worker").catch(() => {
      qc.invalidateQueries({ queryKey: ["worker-chats", user.id] });
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

export const useCraftsmanChat = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCraftsmanChat must be used inside provider");
  return ctx;
};
