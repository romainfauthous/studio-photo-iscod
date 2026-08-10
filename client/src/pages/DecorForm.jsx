import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

function DecorForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // les article_ids cochés
  const [allArticles, setAllArticles] = useState([]);  // tous les articles dispo
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Charger la liste de TOUS les articles (pour afficher les cases)
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await api.get("/articles");
        setAllArticles(response.data);
      } catch (err) {
        console.error("Erreur chargement articles :", err);
        setError("Impossible de charger les articles.");
      }
    }
    fetchArticles();
  }, []);

  // 2. En mode édition : charger le décor et pré-cocher ses articles
  useEffect(() => {
    if (!isEditMode) return;
    async function fetchDecor() {
      try {
        const response = await api.get(`/decors/${id}`);
        const d = response.data;
        setName(d.name);
        setDescription(d.description || "");
        // On récupère les ids des articles déjà dans le décor
        setSelectedIds(d.articles.map((a) => a.article_id));
      } catch (err) {
        console.error("Erreur chargement :", err);
        setError("Impossible de charger ce décor.");
      }
    }
    fetchDecor();
  }, [id, isEditMode]);

  // Sécurité : on retire de la sélection tout article devenu "perdu"
  useEffect(() => {
    if (allArticles.length === 0) return;
    const lostIds = allArticles
      .filter((a) => a.statut === "perdu")
      .map((a) => a.article_id);
    setSelectedIds((prev) => prev.filter((id) => !lostIds.includes(id)));
  }, [allArticles]); 

  // Cocher / décocher un article
  function toggleArticle(articleId) {
    setSelectedIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((x) => x !== articleId) // déjà coché → on retire
        : [...prev, articleId]                // pas coché → on ajoute
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = { name, description, article_ids: selectedIds };
    try {
      if (isEditMode) {
        await api.put(`/decors/${id}`, payload);
      } else {
        await api.post("/decors", payload);
      }
      navigate("/decors");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? "Modifier le décor" : "Nouveau décor"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* La sélection d'articles par cases à cocher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Articles du décor <span className="text-gray-400">({selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""})</span>
            </label>
            <div className="border border-gray-300 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
              {allArticles.map((a) => {
                const isLost = a.statut === "perdu";
                const isDamaged = a.statut === "deteriore";
                return (
                  <label
                    key={a.article_id}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      isLost ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a.article_id)}
                      onChange={() => toggleArticle(a.article_id)}
                      disabled={isLost}
                      className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-sm flex-1">
                      <span className="font-mono text-xs text-gray-500 mr-2">{a.reference}</span>
                      {a.name}
                    </span>
                    {/* Pastille d'état */}
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        a.statut === "disponible"
                          ? "bg-green-100 text-green-700"
                          : isDamaged
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.statut}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="submit" disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button" onClick={() => navigate("/decors")}
              className="text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-300 transition cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default DecorForm;