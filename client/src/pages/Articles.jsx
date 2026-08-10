import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function fetchArticles() {
    try {
      const response = await api.get("/articles");
      setArticles(response.data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement articles :", err);
      setError("Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  async function handleDelete(articleId, articleName) {
    if (!window.confirm(`Supprimer l'article ${articleName} ?`)) return;
    try {
      await api.delete(`/articles/${articleId}`);
      fetchArticles();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("La suppression a échoué.");
    }
  }

  // Couleur de la pastille selon le statut
  function statutStyle(statut) {
    if (statut === "disponible") return "bg-green-100 text-green-700";
    if (statut === "deteriore") return "bg-orange-100 text-orange-700";
    if (statut === "perdu") return "bg-red-100 text-red-700";
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
        <button
          onClick={() => navigate("/articles/new")}
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
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((a) => (
                  <tr key={a.article_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{a.reference}</td>
                    <td className="px-4 py-3">{a.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statutStyle(a.statut)}`}>
                        {a.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.notes || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/articles/${a.article_id}/edit`)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline mr-4 cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(a.article_id, a.name)}
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

export default Articles;