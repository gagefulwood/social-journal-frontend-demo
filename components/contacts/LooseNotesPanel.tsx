"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import EmptyState from "@/components/EmptyState";
import type { ContactLooseNote } from "@/models/contacts";

export default function LooseNotesPanel({
  contactId,
}: {
  contactId: string;
}) {
  const [notes, setNotes] = useState<ContactLooseNote[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      const data = await contactsApi.listNotes(contactId);
      setNotes(data);
    };

    loadNotes();
  }, [contactId]);

  const addNote = async () => {
    if (!text.trim()) return;

    await contactsApi.createNote(contactId, { body: text });
    setText("");

    const data = await contactsApi.listNotes(contactId);
    setNotes(data);
  };

  const activeNotes = notes.filter((n) => n.is_active);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Notes</h3>

      {activeNotes.length === 0 ? (
        <EmptyState title="No notes yet" />
      ) : (
        activeNotes.map((n) => (
          <div key={n.id} className="p-2 bg-gray-50 rounded mb-1">
            <p className="text-sm">{n.body}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(n.created_timestamp).toLocaleDateString()}
            </p>
          </div>
        ))
      )}

      <div className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded px-2"
          placeholder="Add note..."
        />
        <button
          onClick={addNote}
          className="bg-blue-600 text-white px-3 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}