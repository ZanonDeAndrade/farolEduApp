// Legacy helper removido em favor do botão GIS renderButton. Mantido como no-op para compatibilidade de imports.
export const getGoogleIdToken = async (): Promise<string> => {
  throw new Error("getGoogleIdToken foi descontinuado. Use GoogleSignInButton (GIS renderButton).");
};
