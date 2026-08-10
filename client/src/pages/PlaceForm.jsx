import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

const ALLOWED_TYPES = ["studio", "maison"];

function PlaceForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", adress: "", type: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    async function fetchPlace() {
      try {
        const response = await api.get(`/places/${id}`);
        const p = response.data;
        setForm({ name: p.name, adress: p.adress, type: p.type });
      } catch (err) {
        console.error("Erreur chargement :", err);
        setError("Impossible de charger ce lieu.");
      }
    }
    fetchPlace();
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
        await api.put(`/places/${id}`, form);
      } else {
        await api.post("/places", form);
      }
      navigate("/places");
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
          {isEditMode ? "Modifier le lieu" : "Nouveau lieu"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              name="adress" value={form.adress} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type" value={form.type} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choisir un type —</option>
              {ALLOWED_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
              type="button" onClick={() => navigate("/places")}
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

export default PlaceForm;