import { createContext, useContext, useState } from 'react';

/**
 * Contexto central de usuário.
 * Populado após login/signup com o userId efetivo (podendo ser o userId legado
 * de usuários migrados, ou o cognitoSub para novos usuários).
 */
export const UserContext = createContext({
  userId:   null,
  userName: null,
  email:    null,
  setUser:  () => {},
  clearUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState({ userId: null, userName: null, email: null });

  const setUser = ({ userId, userName, email }) =>
    setUserState({ userId, userName, email });

  const clearUser = () =>
    setUserState({ userId: null, userName: null, email: null });

  return (
    <UserContext.Provider value={{ ...user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

/** Hook de atalho */
export const useAppUser = () => useContext(UserContext);
