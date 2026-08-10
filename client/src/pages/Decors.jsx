import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Decors() {
  const [decors, setDecors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function fetchDecors() {
    try {
      const response = await api.get("/decors");
      setDecors(response.data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement décors :", err);
      setError("Impossible de charger les décors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDecors();
  }, []);

  async function handleDelete(decorId, decorName) {
    if (!window.confirm(`Supprimer le décor ${decorName} ?`)) return;
    try {
      await api.delete(`/decors/${decorId}`);
      fetchDecors();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("La suppression a échoué.");
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Décors</h1>
        <button
          onClick={() => navigate("/decors/new")}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
        >
          + Ajouter
        </button>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {decors.map((d) => (
                  <tr key={d.decor_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-gray-500">{d.description || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/decors/${d.decor_id}/edit`)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline mr-4 cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(d.decor_id, d.name)}
                        className="text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                      >
                        Supprimer
                      </button>
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

export default Decors;