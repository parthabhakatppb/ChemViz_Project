// MOCK AUTH for Demo purposes
export const useAuth = () => {
  return {
    user: { id: "1", email: "engineer@chemviz.com" },
    signOut: async () => console.log("Sign out mock"),
    loading: false
  };
};
