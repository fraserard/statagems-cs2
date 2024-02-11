import { createContext, useContext, useEffect, useState } from "react";

import { type User } from "~/lib/session";
import { api } from "~/utils/api";

type Session = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const SessionContext = createContext({} as Session);

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  // attempt to get user data
  const { data } = api.auth.user.useQuery();

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data?.user]);

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
