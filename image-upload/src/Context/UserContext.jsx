import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem('auth-token') || '',
    name: localStorage.getItem('name') || '',
    id: localStorage.getItem('user-id') || '',
    profileimage: localStorage.getItem('profileimage') || null, // Initialize profileimage from localStorage
  });

  const login = (token, name, id, profileimage = null) => {
    setUser({ token, name, id, profileimage });
    localStorage.setItem('auth-token', token);
    localStorage.setItem('name', name);
    localStorage.setItem('user-id', id);
    if (profileimage) {
      localStorage.setItem('profileimage', profileimage); // Store profileimage in localStorage
    }
  };

  const logout = () => {
    setUser({ token: '', name: '', id: '', profileimage: null });
    localStorage.removeItem('auth-token');
    localStorage.removeItem('name');
    localStorage.removeItem('user-id');
    localStorage.removeItem('profileimage'); // Remove profileimage from localStorage on logout
  };

  const updateProfileImage = (newProfileImage) => {
    setUser((prevUser) => ({
      ...prevUser,
      profileimage: newProfileImage,
    }));
    localStorage.setItem('profileimage', newProfileImage); // Update profileimage in localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};
