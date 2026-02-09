export const normalizeArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;

  if (Array.isArray(res?.data)) return res.data;

  if (Array.isArray(res?.data?.data)) return res.data.data;

  return [];
};
