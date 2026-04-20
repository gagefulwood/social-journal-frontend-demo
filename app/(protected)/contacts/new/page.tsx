import { ContactForm } from "@/components/contacts/ContactForm";

export default function NewContactPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6">New Contact</h2>
      <ContactForm />
    </div>
  );
}