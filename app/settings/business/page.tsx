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
  <div className="w-full ">
    <div className=" bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="border-b justify-center border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Business Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your business information.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">

        {message && (
          <div className="mb-6 bg-green-100 text-green-700 rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6">

          {/* Business Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div className="xl:col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              Address
            </label>

            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         resize-none focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LKR">LKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={saveBusinessSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white
                       px-6 py-2.5 rounded-lg font-medium
                       transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  </div>
);
}