"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import EmptyState from "@/components/EmptyState";

type Note = {
  id: number;
  text: string;
};

export default function LooseNotesPanel({
  contactId,
}: {
  contactId: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      const data = await contactsApi.getNotes(contactId);
      setNotes(data);
    };

    loadNotes();
  }, [contactId]);

  const addNote = async () => {
    if (!text.trim()) return;

    await contactsApi.addNote(contactId, { text });
    setText("");
    
    // reload notes
    const data = await contactsApi.getNotes(contactId);
    setNotes(data);
  };

  const grouped = {
    General: notes,
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Notes</h3>

      {notes.length === 0 ? (
        <EmptyState title="No notes yet" />
      ) : (
        Object.entries(grouped).map(([marker, items]) => (
          <div key={marker} className="mb-3">
            <h4 className="font-medium mb-1">{marker}</h4>

            {items.map((n) => (
              <div key={n.id} className="p-2 bg-gray-50 rounded mb-1">
                {n.text}
              </div>
            ))}
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