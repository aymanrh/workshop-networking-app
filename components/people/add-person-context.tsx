"use client";

import * as React from "react";
import { addAttendee } from "@/lib/db/repositories/events";

type OpenOptions = {
  presetEventMetId?: string;
  afterSubmit?: (newPersonId: string) => Promise<void> | void;
  keepOpenAfterSave?: boolean;
};

type AddPersonState = {
  isOpen: boolean;
  presetEventMetId: string | undefined;
  afterSubmit: ((newPersonId: string) => Promise<void> | void) | undefined;
  keepOpenAfterSave: boolean;
  setKeepOpenAfterSave: (v: boolean) => void;
  open: () => void;
  openWithEventId: (eventId: string) => void;
  openWithOptions: (opts: OpenOptions) => void;
  close: () => void;
  setOpen: (v: boolean) => void;
};

const AddPersonContext = React.createContext<AddPersonState | null>(null);

export function AddPersonProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [presetEventMetId, setPresetEventMetId] = React.useState<
    string | undefined
  >(undefined);
  const [afterSubmit, setAfterSubmit] = React.useState<
    ((newPersonId: string) => Promise<void> | void) | undefined
  >(undefined);
  const [keepOpenAfterSave, setKeepOpenAfterSave] = React.useState(false);

  const reset = React.useCallback(() => {
    setPresetEventMetId(undefined);
    setAfterSubmit(undefined);
    setKeepOpenAfterSave(false);
  }, []);

  const value = React.useMemo<AddPersonState>(
    () => ({
      isOpen,
      presetEventMetId,
      afterSubmit,
      keepOpenAfterSave,
      setKeepOpenAfterSave,
      open: () => {
        reset();
        setIsOpen(true);
      },
      openWithEventId: (eventId: string) => {
        setPresetEventMetId(eventId);
        const cb = (newPersonId: string) => addAttendee(eventId, newPersonId);
        setAfterSubmit(() => cb);
        setKeepOpenAfterSave(true);
        setIsOpen(true);
      },
      openWithOptions: (opts: OpenOptions) => {
        setPresetEventMetId(opts.presetEventMetId);
        setAfterSubmit(() => opts.afterSubmit);
        setKeepOpenAfterSave(opts.keepOpenAfterSave ?? false);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        reset();
      },
      setOpen: (v: boolean) => {
        setIsOpen(v);
        if (!v) reset();
      },
    }),
    [isOpen, presetEventMetId, afterSubmit, keepOpenAfterSave, reset],
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
