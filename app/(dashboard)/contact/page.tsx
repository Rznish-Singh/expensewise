"use client";

import { useState } from "react";
import { Send, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({
    name:    "",
    email:   "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]             = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
      toast.success("Message sent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[700px] animate-fade-in">
      <PageHeader
        title="Contact Support"
        subtitle="Get in touch with the ExpenseWise team"
      />

      {sent ? (
        <Card className="text-center py-16">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-light mb-2">Message Sent!</h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            We've received your message and will respond within 24 hours.
          </p>
          <Button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
            Send Another Message
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Info cards */}
          <div className="space-y-4 md:col-span-1">
            <Card padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-green-700" />
                </div>
                <div>
                  <div className="text-[13px] font-medium mb-1">Email Support</div>
                  <div className="text-[12px] text-muted-foreground">support@ExpenseWise.app</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Reply within 24 hours</div>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-purple-700" />
                </div>
                <div>
                  <div className="text-[13px] font-medium mb-1">Live Chat</div>
                  <div className="text-[12px] text-muted-foreground">Available Mon–Fri</div>
                  <div className="text-[11px] text-muted-foreground mt-1">9 AM – 6 PM IST</div>
                </div>
              </div>
            </Card>
            <Card padding="sm" className="bg-green-50 border-green-100">
              <div className="text-[12px] text-green-800">
                <div className="font-medium mb-1">API Status</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All systems operational
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <Card className="md:col-span-2">
            <h2 className="text-[14px] font-medium mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="">Select a subject…</option>
                  <option value="Billing question">Billing question</option>
                  <option value="Bug report">Bug report</option>
                  <option value="Feature request">Feature request</option>
                  <option value="Data export help">Data export help</option>
                  <option value="Account issue">Account issue</option>
                  <option value="General enquiry">General enquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all resize-none"
                  placeholder="Describe your question or issue in detail…"
                />
              </div>
              <Button
                type="submit"
                loading={submitting}
                icon={<Send size={14} />}
                className="w-full justify-center"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
