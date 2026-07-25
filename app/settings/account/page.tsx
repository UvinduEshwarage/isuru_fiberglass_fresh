"use client";

import { useState } from "react";

export default function AccountSettingsPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setSuccess("");
    setError("");

    if (!form.currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (
      form.newPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/settings/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newEmail: form.newEmail,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update account.");
      }

      // Save the new JWT if email changed
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess(data.message || "Account updated successfully.");

      setForm({
        currentPassword: "",
        newEmail: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow border">

        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">
            Account Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Update your login email and password.
          </p>
        </div>

        <div className="p-6 space-y-6">

          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              New Email
            </label>

            <input
              type="email"
              value={form.newEmail}
              onChange={(e) =>
                setForm({
                  ...form,
                  newEmail: e.target.value,
                })
              }
              placeholder="Leave empty to keep current email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Current Password
            </label>

            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  currentPassword: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              New Password
            </label>

            <input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  newPassword: e.target.value,
                })
              }
              placeholder="Leave empty to keep current password"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Confirm New Password
            </label>

            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}