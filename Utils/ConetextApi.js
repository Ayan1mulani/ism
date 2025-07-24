import { createContext, useContext, useState } from 'react';

// Create a context for permissions
const PermissionsContext = createContext();

// Create a provider component
export const PermissionsProvider = ({ children }) => {
  const [nightMode, setNightMode] = useState(false);
  // 🆕 Queue status state


  return (
    <PermissionsContext.Provider
      value={{
        nightMode,
        setNightMode
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

// Custom hook to use the Permissions context
export const usePermissions = () => {
  return useContext(PermissionsContext);
};
