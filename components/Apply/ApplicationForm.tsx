"use client";
import React, { useState } from "react";
import { z } from "zod";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Введите ФИО"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(7, "Некорректный телефон"),
  message: z.string().min(3, "Введите сообщение"),
});

export default function ApplicationForm() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const result = applicationSchema.safeParse(form);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      const errMap: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([k, v]) => {
        if (v && v[0]) errMap[k] = v[0];
      });
      setErrors(errMap);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      setForm({ fullName: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:bg-[#0b0b0b]">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-50">Оставить заявку</h2>
      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-600 dark:text-zinc-400">ФИО</span>
          <input name="fullName" value={form.fullName} onChange={handleChange} className="rounded-md border px-3 py-2 text-sm" />
          {errors.fullName && <span className="mt-1 text-xs text-red-600">{errors.fullName}</span>}
        </label>

        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-600 dark:text-zinc-400">Email</span>
          <input name="email" value={form.email} onChange={handleChange} type="email" className="rounded-md border px-3 py-2 text-sm" />
          {errors.email && <span className="mt-1 text-xs text-red-600">{errors.email}</span>}
        </label>

        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-600 dark:text-zinc-400">Телефон</span>
          <input name="phone" value={form.phone} onChange={handleChange} className="rounded-md border px-3 py-2 text-sm" />
          {errors.phone && <span className="mt-1 text-xs text-red-600">{errors.phone}</span>}
        </label>

        <label className="flex flex-col">
          <span className="mb-1 text-sm text-gray-600 dark:text-zinc-400">Сообщение</span>
          <textarea name="message" value={form.message} onChange={handleChange} rows={4} className="rounded-md border px-3 py-2 text-sm" />
          {errors.message && <span className="mt-1 text-xs text-red-600">{errors.message}</span>}
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-full bg-foreground px-4 py-2 text-sm text-background" disabled={status === "submitting"}>
            {status === "submitting" ? "Отправка..." : "Отправить заявку"}
          </button>
          {status === "success" && <span className="text-sm text-green-600">Отправлено.</span>}
          {status === "error" && <span className="text-sm text-red-600">Ошибка отправки.</span>}
        </div>
      </div>
    </form>
  );
}