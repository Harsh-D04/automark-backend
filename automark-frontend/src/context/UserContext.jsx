import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "👤",
    joinDate: "January 2024",
    adsGenerated: 0,
    plan: "Free",
    generatedAds: [], // Array to store all generated ads
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("automark_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("automark_user", JSON.stringify(user));
  }, [user]);

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const incrementAdsGenerated = () => {
    setUser((prev) => ({
      ...prev,
      adsGenerated: (prev.adsGenerated || 0) + 1,
    }));
  };

  const addGeneratedAd = (adData) => {
    setUser((prev) => {
      const newAd = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...adData,
      };
      return {
        ...prev,
        generatedAds: [newAd, ...(prev.generatedAds || [])], // Add to beginning
        adsGenerated: (prev.adsGenerated || 0) + 1,
      };
    });
  };

  const deleteGeneratedAd = (adId) => {
    setUser((prev) => ({
      ...prev,
      generatedAds: (prev.generatedAds || []).filter((ad) => ad.id !== adId),
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        incrementAdsGenerated,
        addGeneratedAd,
        deleteGeneratedAd,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

