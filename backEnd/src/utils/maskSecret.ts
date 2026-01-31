export const maskSecret = (value?: string | null) => {
  if (!value) return value ?? "";
  if (value.length <= 12) return "*".repeat(value.length);
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};
