import { useState, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

const TABS = [
  { key: "work", label: "Jours travaillés" },
  { key: "work-user", label: "Par prestataire" },
  { key: "articles", label: "Articles photographiés" },
  { key: "decors", label: "Décors photographiés" },
];

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

function History() {
  const [activeTab, setActiveTab] = useState("work");
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger la liste des prestataires pour le filtre "par prestataire"
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("/users");
        setUsers(response.data.filter((u) => u.role !== "admin"));
      } catch (err) {
        console.error("Erreur chargement users :", err);
      }
    }
    fetchUsers();
  }, []);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      setData([]);
      try {
        let url = "";
        if (activeTab === "work") url = "/history/work";
        else if (activeTab === "work-user") {
          if (!selectedUserId) { setLoading(false); return; }
          url = `/history/work/user/${selectedUserId}`;
        }
        else if (activeTab === "articles") url = "/history/articles";
        else if (activeTab === "decors") url = "/history/decors";

        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        console.error("Erreur chargement historique :", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab, selectedUserId]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historiques</h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setData([]); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtre prestataire */}
      {activeTab === "work-user" && (
        <div className="mb-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Choisir un prestataire —</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Historique global + par prestataire */}
      {(activeTab === "work" || activeTab === "work-user") && !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Lieu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      {activeTab === "work-user" && !selectedUserId
                        ? "Sélectionnez un prestataire."
                        : "Aucun résultat."}
                    </td>
                  </tr>
                )}
                {data.map((e) => (
                  <tr key={e.event_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(e.start_date)}</td>
                    <td className="px-4 py-3">{TYPE_LABELS[e.type] || e.type}</td>
                    <td className="px-4 py-3 text-gray-500">{e.place_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Articles photographiés */}
      {activeTab === "articles" && !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Article</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Validé par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun résultat.</td>
                  </tr>
                )}
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.reference}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{formatDate(row.start_date)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.validated_by_first_name
                        ? `${row.validated_by_first_name} ${row.validated_by_name}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Décors photographiés */}
      {activeTab === "decors" && !loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Décor</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Validé par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">Aucun résultat.</td>
                  </tr>
                )}
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{formatDate(row.start_date)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.validated_by_first_name
                        ? `${row.validated_by_first_name} ${row.validated_by_name}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default History;