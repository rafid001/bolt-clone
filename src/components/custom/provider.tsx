"use client";
import { UserDetailContext } from "@/context/userDetailContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  const [userDetail, setUserDetail] = useState({});
  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </UserDetailContext.Provider>
  );
};

export default Provider;
