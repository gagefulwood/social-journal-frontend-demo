"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactsApi } from "@/lib/api/contactsApi";
import { useDebounce } from "@/hooks/useDebounce";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type { ContactListItem } from "@/types/contacts";
import { contactName, idsMatch } from "@/components/contacts/contact-utils";

type ContactPickerProps = {
  value?: ApiId | ApiId[];
  multiple?: boolean;
  onChange: (value: ApiId | ApiId[] | null) => void;
  onContactSelect?: (contact: ContactListItem | null) => void;
};

export function ContactPicker({
  value,
  multiple = false,
  onChange,
  onContactSelect,
}: ContactPickerProps) {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value : value == null ? [] : [value]),
    [value]
  );
  const selectedContacts = contacts.filter((contact) =>
    selectedIds.some((id) => idsMatch(id, contact.id))
  );

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const response = await contactsApi.list({
          name: debouncedSearch || undefined,
          page_size: 10,
        });
        if (isActive) {
          setContacts(response.results);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(err as ApiError);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch]);

  function selectContact(id: ApiId) {
    const contact = contacts.find((item) => idsMatch(item.id, id)) ?? null;

    if (!multiple) {
      onChange(id);
      onContactSelect?.(contact);
      return;
    }

    if (selectedIds.some((selectedId) => idsMatch(selectedId, id))) {
      onChange(selectedIds.filter((selectedId) => !idsMatch(selectedId, id)));
      onContactSelect?.(null);
      return;
    }

    onChange([...selectedIds, id]);
    onContactSelect?.(contact);
  }

  function removeContact(id: ApiId) {
    if (!multiple) {
      onChange(null);
      onContactSelect?.(null);
      return;
    }

    const nextIds = selectedIds.filter((selectedId) => !idsMatch(selectedId, id));
    onChange(nextIds.length ? nextIds : null);
    onContactSelect?.(null);
  }

  return (
    <div className="space-y-3">
      <Input
        value={search}
        placeholder="Search contacts"
        onChange={(event) => setSearch(event.target.value)}
      />

      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedContacts.map((contact) => (
            <span
              key={contact.id}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
            >
              {contactName(contact)}
              <button
                type="button"
                onClick={() => removeContact(contact.id)}
                aria-label={`Remove ${contactName(contact)}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="max-h-64 overflow-y-auto rounded-md border border-border">
        {contacts.map((contact) => {
          const selected = selectedIds.some((id) => idsMatch(id, contact.id));

          return (
            <button
              key={contact.id}
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => selectContact(contact.id)}
            >
              <span>{contactName(contact)}</span>
              {selected && <span className="text-xs text-muted-foreground">Selected</span>}
            </button>
          );
        })}
        {contacts.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            No contacts found.
          </p>
        )}
      </div>

      {!multiple && selectedIds.length > 0 && (
        <Button type="button" variant="outline" onClick={() => removeContact(selectedIds[0])}>
          Clear
        </Button>
      )}
    </div>
  );
}
