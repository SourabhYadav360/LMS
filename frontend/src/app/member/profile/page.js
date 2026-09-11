"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContext";
import { updateMyMemberProfile } from "@/services/member.service";

export default function MemberProfilePage() {
	const { user, setUser } = useAuth();
	const [form, setForm] = useState({ password: "" });
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);

		try {
			const payload = {
				name: form.name ?? user?.name ?? "",
				email: form.email ?? user?.email ?? "",
			};
			if (form.password) payload.password = form.password;
			const response = await updateMyMemberProfile(payload);
			setUser(response.data);
			setForm((current) => ({ ...current, password: "" }));
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to update profile");
		} finally {
			setSaving(false);
		}
	};

	return (
		<main className="mx-auto max-w-2xl space-y-6">
			<div>
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Account</p>
				<h1 className="mt-2 text-3xl font-bold">My Profile</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
				<Field label="Name" name="name" value={form.name ?? user?.name ?? ""} onChange={setForm} />
				<Field label="Email" name="email" type="email" value={form.email ?? user?.email ?? ""} onChange={setForm} />
				<Field label="New password" name="password" type="password" value={form.password} onChange={setForm} />
				<Info label="Role" value={user?.role} />
				<Info label="Status" value={user?.status} />
				<button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
					{saving ? "Saving..." : "Save changes"}
				</button>
			</form>
		</main>
	);
}

function Field({ label, name, type = "text", value, onChange }) {
	return (
		<label className="block text-sm font-semibold text-slate-700">
			{label}
			<input type={type} name={name} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-500" />
		</label>
	);
}

function Info({ label, value }) {
	return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-900">{value || "-"}</p></div>;
}
