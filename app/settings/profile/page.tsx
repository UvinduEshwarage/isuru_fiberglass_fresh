// export default function profileSettingsPage() {
//     return(
//         <div>
//             <h1>Profile Settings</h1>
//             <p>This is the profile settings page.</p>
//         </div>
//     )
// }
"use client";

import { useEffect, useState } from "react";

interface Profile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/settings/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load profile.");
      }

      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);

      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">

      <div className="bg-white rounded-xl shadow border">

        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">
            Profile Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Update your administrator profile.
          </p>
        </div>

        <div className="p-6 space-y-6">

          {message && (
            <div className="rounded-lg bg-green-100 text-green-700 px-4 py-3">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-100 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              Name
            </label>

            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Phone Number
            </label>

            <input
              type="text"
              value={profile.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  phone: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Role
            </label>

            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={saveProfile}
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