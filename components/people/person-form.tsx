"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagChipInput } from "./tag-chip-input";
import { useEvents } from "@/hooks/use-events";
import {
  personFormSchema,
  type PersonFormValues,
} from "@/lib/validators/person";

const NONE_VALUE = "__none__";

type Props = {
  mode: "create" | "edit";
  defaultValues?: Partial<PersonFormValues>;
  onSubmit: (values: PersonFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const EMPTY_DEFAULTS: PersonFormValues = {
  name: "",
  role: "",
  company: "",
  note: "",
  tags: [],
  eventMetId: undefined,
  closeness: "warm",
};

export function PersonForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const events = useEvents();
  const eventsEmpty = events !== undefined && events.length === 0;

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      eventMetId: values.eventMetId === NONE_VALUE ? undefined : values.eventMetId,
    });
  });

  const submitting = form.formState.isSubmitting;
  const nameValue = form.watch("name");
  const canSubmit = !submitting && nameValue.trim().length > 0;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Sara Kim"
                  autoFocus={mode === "create"}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input
                  placeholder="Designer at Linear"
                  autoComplete="off"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional"
                  autoComplete="off"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagChipInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                {mode === "edit" ? (
                  <Textarea
                    placeholder="One line you don't want to forget"
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                  />
                ) : (
                  <Input
                    placeholder="One line you don't want to forget"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(!eventsEmpty || mode === "edit") && (
          <FormField
            control={form.control}
            name="eventMetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Where you met</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? NONE_VALUE}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          eventsEmpty ? "No events yet" : "Select event"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>—</SelectItem>
                    {events?.map((evt) => (
                      <SelectItem key={evt.id} value={evt.id}>
                        {evt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Saving…" : (submitLabel ?? "Add person")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
