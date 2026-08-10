import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

const ALLOWED_ROLES = [
  "admin", "photographe", "assistant_photographe",
  "decorateur", "assistant_decorateur", "chauffeur_assistant",
];

function UserForm() {
  const { id } = useParams();       // présent si on est en mode "modifier"
  const isEditMode = Boolean(id);   // true = modifier, false = créer
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", first_name: "", phone: "", email: "", password: "", role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // En mode modification : on charge les données existantes pour pré-remplir
  useEffect(() => {
    if (!isEditMode) return;
    async function fetchUser() {
      try {
        const response = await api.get(`/users/${id}`);
        const user = response.data;
        setForm({
          name: user.name, first_name: user.first_name, phone: user.phone,
          email: user.email, password: "", role: user.role,
        });
      } catch (err) {
        console.error("Erreur chargement :", err);
        setError("Impossible de charger ce prestataire.");
      }
    }
    fetchUser();
  }, [id, isEditMode]);

  // Met à jour un champ du formulaire
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/users/${id}`, form);
      } else {
        await api.post("/users", form);
      }
      navigate("/users"); // retour à la liste
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
          {isEditMode ? "Modifier le prestataire" : "Nouveau prestataire"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nom" name="name" value={form.name} onChange={handleChange} />
          <Field label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} />
          <Field label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe {isEditMode && <span className="text-gray-400">(laisser vide pour ne pas changer)</span>}
            </label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choisir un rôle —</option>
              {ALLOWED_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
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
              type="button" onClick={() => navigate("/users")}
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

// Composant réutilisable pour un champ texte
function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default UserForm;