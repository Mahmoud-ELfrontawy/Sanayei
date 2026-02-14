export const pushUniqueMessage = (old: any[] = [], msg: any) => {
  if (old.some((m) => m.id === msg.id)) return old;
  return [...old, msg];
};

export const pushUniqueNotification = (old: any[] = [], notif: any, limit = 100) => {
  if (old.some((n) => n.id === notif.id)) return old;
  const next = [notif, ...old];
  return next.slice(0, limit);
};