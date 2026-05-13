"use client";

import * as React from "react";

type AddPersonState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
};

const AddPersonContext = React.createContext<AddPersonState | null>(null);

export function AddPersonProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo<AddPersonState>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      setOpen: setIsOpen,
    }),
    [isOpen],
  );
  return (
    <AddPersonContext.Provider value={value}>
      {children}
    </AddPersonContext.Provider>
  );
}

export function useAddPerson(): AddPersonState {
  const ctx = React.useContext(AddPersonContext);
  if (!ctx) {
    throw new Error("useAddPerson must be used inside <AddPersonProvider>");
  }
  return ctx;
}
