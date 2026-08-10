import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Places() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function fetchPlaces() {
    try {
      const response = await api.get("/places");
      setPlaces(response.data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement lieux :", err);
      setError("Impossible de charger les lieux.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, []);

  async function handleDelete(placeId, placeName) {
    if (!window.confirm(`Supprimer le lieu ${placeName} ?`)) return;
    try {
      await api.delete(`/places/${placeId}`);
      fetchPlaces();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("La suppression a échoué.");
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lieux</h1>
        <button
          onClick={() => navigate("/places/new")}
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
                  <th className="px-4 py-3 font-medium">Adresse</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {places.map((p) => (
                  <tr key={p.place_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.adress}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/places/${p.place_id}/edit`)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline mr-4 cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(p.place_id, p.name)}
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

export default Places;