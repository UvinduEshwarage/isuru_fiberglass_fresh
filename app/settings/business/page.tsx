// export default function businessSettingsPage() {
//     return(
//         <div>
//             <h1>Business Settings</h1>
//             <p>This is the business settings page.</p>
//         </div>
//     )
// }
"use client";

import { useEffect, useState } from "react";

interface BusinessSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
}

export default function BusinessSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    currency: "LKR",
    taxRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  async function loadBusinessSettings() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/settings/business", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load business settings.");
      }

      setSettings({
        businessName: data.businessName || "",
        ownerName: data.ownerName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        currency: data.currency || "LKR",
        taxRate: data.taxRate || 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveBusinessSettings() {
    try {
      setSaving(true);

      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/settings/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update business settings.");
      }

      setMessage("Business settings updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading business settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      <div className="bg-white rounded-xl shadow border">

        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">
            Business Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your business information.
          </p>
        </div>

        <div className="p-6 space-y-6">

          {message && (
            <div className="bg-green-100 text-green-700 rounded-lg px-4 py-3">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              Business Name
            </label>

            <input
              type="text"
              value={settings.businessName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  businessName: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Owner Name
            </label>

            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ownerName: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Phone
              </label>

              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    phone: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

          </div>

          <div>
            <label className="block mb-2 font-medium">
              Address
            </label>

            <textarea
              rows={4}
              value={settings.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Currency
              </label>

              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Tax Rate (%)
              </label>

              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taxRate: Number(e.target.value),
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

          </div>

          <div className="pt-4">
            <button
              onClick={saveBusinessSettings}
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