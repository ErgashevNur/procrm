import { createContext, useContext, useState, useCallback } from "react";

const USER_UPDATED_EVENT = "crm:user-updated";

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.user ?? {};
  } catch {
    return {};
  }
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(readUserFromStorage);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
