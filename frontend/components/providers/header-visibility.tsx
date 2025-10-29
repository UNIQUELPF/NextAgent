"use client";

import { createContext, useContext, useEffect, useState } from "react";

type HeaderVisibilityContextValue = {
  visible: boolean;
  setVisible: (value: boolean) => void;
};

const HeaderVisibilityContext = createContext<HeaderVisibilityContextValue>({
  visible: true,
  setVisible: () => {},
});

export function HeaderVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);

  return (
    <HeaderVisibilityContext.Provider value={{ visible, setVisible }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility() {
  return useContext(HeaderVisibilityContext);
}

export function HeaderVisibility({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  const { setVisible } = useHeaderVisibility();

  useEffect(() => {
    setVisible(visible);
    return () => setVisible(true);
  }, [setVisible, visible]);

  return <>{children}</>;
}

