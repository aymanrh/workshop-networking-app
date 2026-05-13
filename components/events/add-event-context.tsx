"use client";

import * as React from "react";

type AddEventState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
};

const AddEventContext = React.createContext<AddEventState | null>(null);

export function AddEventProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo<AddEventState>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      setOpen: setIsOpen,
    }),
    [isOpen],
  );
  return (
    <AddEventContext.Provider value={value}>
      {children}
    </AddEventContext.Provider>
  );
}

export function useAddEvent(): AddEventState {
  const ctx = React.useContext(AddEventContext);
  if (!ctx) {
    throw new Error("useAddEvent must be used inside <AddEventProvider>");
  }
  return ctx;
}
