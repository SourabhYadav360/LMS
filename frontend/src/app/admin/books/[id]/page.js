"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import { getBookById, updateBook } from "@/services/book.service";
import { getCategories } from "@/services/category.service";

const initialForm = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  totalCopies: "",
  categoryId: "",
};

export default function BookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [book, setBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const [bookResponse, categoryResponse] = await Promise.all([
          getBookById(id),
          getCategories(),
        ]);
        const loadedBook = bookResponse.data;
        setBook(loadedBook);
        setForm({
          title: loadedBook.title || "",
          author: loadedBook.author || "",
          isbn: loadedBook.isbn || "",
          description: loadedBook.description || "",
          totalCopies: loadedBook.totalCopies ?? "",
          categoryId: loadedBook.categoryId || loadedBook.category?.id || "",
        });
        setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load book.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBook();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await updateBook(id, {
        ...form,
        totalCopies: Number(form.totalCopies),
      });
      setBook(response.data);
      toast.success(response.message || "Book updated successfully.");
      router.replace(`/admin/books/${id}`);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update book.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading book...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (!book) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button type="button" onClick={() => router.push("/admin/books")} className="mb-3 text-sm font-semibold text-blue-700 hover:text-blue-900">Back to books</button>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{editMode ? "Edit book" : book.title}</h1>
          {!editMode && <p className="mt-2 text-sm text-slate-500">View the complete catalog record.</p>}
        </div>
        {!editMode && <button type="button" onClick={() => router.push(`/admin/books/${id}?edit=true`)} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Edit book</button>}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title" name="title" value={form.title} onChange={handleChange} required />
            <Field label="Author" name="author" value={form.author} onChange={handleChange} required />
            <Field label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} required />
            <Field label="Total copies" name="totalCopies" value={form.totalCopies} onChange={handleChange} type="number" min="1" required />
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Category</span><select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Description</span><textarea name="description" value={form.description} onChange={handleChange} rows="5" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => router.push(`/admin/books/${id}`)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Title" value={book.title} />
          <Detail label="Author" value={book.author} />
          <Detail label="ISBN" value={book.isbn} />
          <Detail label="Category" value={book.category?.name || "Uncategorized"} />
          <Detail label="Total copies" value={book.totalCopies} />
          <Detail label="Available copies" value={book.availableCopies} />
          <Detail label="Status" value={book.status} />
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{book.description || "No description provided."}</p></div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", ...props }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input name={name} value={value} onChange={onChange} type={type} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" {...props} /></label>;
}

function Detail({ label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-base font-semibold text-slate-900">{value || "-"}</p></div>;
}
