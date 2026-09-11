"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getMe } from "@/services/auth.service";
import { updateMyLibrarianProfile } from "@/services/librarian.service";

export default function LibrarianProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMe();
        const currentUser =
          response?.user ||
          response?.data?.user ||
          response?.data;

        if (!currentUser) {
          throw new Error("User data not found from /auth/me");
        }

        setUser(currentUser);
        setForm({ name: currentUser.name || "", email: currentUser.email || "", password: "" });
      } catch (requestError) {
        const message = requestError.response?.data?.message || "Unable to load profile.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) return <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading profile...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const response = await updateMyLibrarianProfile(payload);
      setUser(response.data);
      setForm((current) => ({ ...current, password: "" }));
      toast.success("Profile updated successfully");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return <div className="mx-auto max-w-2xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Account</p><h1 className="mt-2 text-3xl font-bold text-slate-950">My Profile</h1></div><form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"><Field label="Name" name="name" value={form.name} onChange={setForm} /><Field label="Email" name="email" type="email" value={form.email} onChange={setForm} /><Field label="New password" name="password" type="password" value={form.password} onChange={setForm} /><Info label="Role" value={user?.role} /><Info label="Status" value={user?.status} /><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button></form></div>;
}

function Field({ label, name, type = "text", value, onChange }) { return <label className="block text-sm font-semibold text-slate-700">{label}<input type={type} name={name} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500" /></label>; }
function Info({ label, value }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-base font-semibold text-slate-900">{value || "-"}</p></div>; }
