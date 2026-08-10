import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

const ALLOWED_STATUTS = ["disponible", "deteriore", "perdu"];

function ArticleForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ reference: "", name: "", statut: "", notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    async function fetchArticle() {
      try {
        const response = await api.get(`/articles/${id}`);
        const a = response.data;
        setForm({
          reference: a.reference, name: a.name,
          statut: a.statut, notes: a.notes || "",
        });
      } catch (err) {
        console.error("Erreur chargement :", err);
        setError("Impossible de charger cet article.");
      }
    }
    fetchArticle();
  }, [id, isEditMode]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/articles/${id}`, form);
      } else {
        await api.post("/articles", form);
      }
      navigate("/articles");
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
          {isEditMode ? "Modifier l'article" : "Nouvel article"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              name="reference" value={form.reference} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="statut" value={form.statut} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choisir un statut —</option>
              {ALLOWED_STATUTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              name="notes" value={form.notes} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              type="button" onClick={() => navigate("/articles")}
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

export default ArticleForm;