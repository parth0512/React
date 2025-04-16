// src/context/UserContextProvider.jsx
import React, { useState } from "react";
import UserContext from "./UserContext"; // ✅ Make sure this is './UserContext'

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
