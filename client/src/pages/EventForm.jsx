import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

const ALLOWED_TYPES = [
  "shooting_studio",
  "shooting_decor",
  "prepa_decor",
  "retrait_decor",
];

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

const REQUIRED_ROLES = {
  shooting_studio: ["photographe", "assistant_photographe"],
  prepa_decor: ["decorateur", "assistant_decorateur", "chauffeur_assistant"],
  shooting_decor: ["decorateur", "assistant_decorateur", "photographe", "assistant_photographe", "chauffeur_assistant"],
  retrait_decor: ["assistant_decorateur", "chauffeur_assistant"],
};

function EventForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Infos de base
  const [type, setType] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sélections
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedArticleIds, setSelectedArticleIds] = useState([]);
  const [selectedDecorIds, setSelectedDecorIds] = useState([]);

  // Données à charger
  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [decors, setDecors] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Convertit une date ISO en format datetime-local (input HTML)
  function toDatetimeLocal(isoString) {
  // Prend la date telle quelle depuis la BDD, retire juste le .000Z
    return isoString.slice(0, 16).replace("T", "T");
  }

  // Convertit datetime-local en format MySQL
  function toMySQLDate(datetimeLocal) {
    // Envoie au back exactement ce que l'utilisateur a saisi
    return datetimeLocal.replace("T", " ") + ":00";
  }

  // Charger les données de référence
  useEffect(() => {
    async function loadData() {
      try {
        const [placesRes, usersRes, articlesRes, decorsRes] = await Promise.all([
          api.get("/places"),
          api.get("/users"),
          api.get("/articles"),
          api.get("/decors"),
        ]);
        setPlaces(placesRes.data);
        setUsers(usersRes.data);
        setArticles(articlesRes.data);
        setDecors(decorsRes.data);
      } catch (err) {
        console.error("Erreur chargement données :", err);
        setError("Impossible de charger les données.");
      }
    }
    loadData();
  }, []);

  // En mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (!isEditMode) return;
    async function loadEvent() {
      try {
        const res = await api.get(`/events/${id}`);
        const e = res.data;
        setType(e.type);
        setPlaceId(e.place_id);
        setStartDate(toDatetimeLocal(e.start_date));
        setEndDate(toDatetimeLocal(e.end_date));
        setSelectedUserIds(e.users.map((u) => u.user_id));
        setSelectedArticleIds(e.articles?.map((a) => a.article_id) || []);
        setSelectedDecorIds(e.decors?.map((d) => d.decor_id) || []);
      } catch (err) {
        console.error("Erreur chargement event :", err);
        setError("Impossible de charger cet événement.");
      }
    }
    loadEvent();
  }, [id, isEditMode]);

  // Toggle prestataire
  function toggleUser(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((x) => x !== userId)
        : [...prev, userId]
    );
  }

  // Toggle article
  function toggleArticle(articleId) {
    setSelectedArticleIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((x) => x !== articleId)
        : [...prev, articleId]
    );
  }

  // Toggle décor
  function toggleDecor(decorId) {
    setSelectedDecorIds((prev) =>
      prev.includes(decorId)
        ? prev.filter((x) => x !== decorId)
        : [...prev, decorId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      type,
      place_id: Number(placeId),
      start_date: toMySQLDate(startDate),
      end_date: toMySQLDate(endDate),
      user_ids: selectedUserIds,
    };

    if (type === "shooting_studio") payload.article_ids = selectedArticleIds;
    if (type === "shooting_decor") payload.decor_ids = selectedDecorIds;

    try {
      if (isEditMode) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      navigate("/planning");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  // Rôles présents parmi les prestataires sélectionnés
  const presentRoles = users
    .filter((u) => selectedUserIds.includes(u.user_id))
    .map((u) => u.role);

  // Rôles manquants pour le type sélectionné
  const missingRoles = type
    ? (REQUIRED_ROLES[type] || []).filter((r) => !presentRoles.includes(r))
    : [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? "Modifier l'événement" : "Nouvel événement"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSelectedUserIds([]);
                setSelectedArticleIds([]);
                setSelectedDecorIds([]);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choisir un type —</option>
              {ALLOWED_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choisir un lieu —</option>
              {places.map((p) => (
                <option key={p.place_id} value={p.place_id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Prestataires */}
          {type && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prestataires ({selectedUserIds.length} sélectionné{selectedUserIds.length > 1 ? "s" : ""})
              </label>

              {/* Rôles requis */}
              <div className="mb-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                <span className="font-medium">Rôles requis : </span>
                {REQUIRED_ROLES[type].join(", ")}
              </div>

              {/* Rôles manquants */}
              {missingRoles.length > 0 && (
                <div className="mb-2 p-2 bg-red-50 rounded-lg text-xs text-red-700">
                  <span className="font-medium">Manquants : </span>
                  {missingRoles.join(", ")}
                </div>
              )}

              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                {users
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <label
                      key={u.user_id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.user_id)}
                        onChange={() => toggleUser(u.user_id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm flex-1">
                        {u.first_name} {u.name}
                        <span className="ml-2 text-xs text-gray-400">{u.role}</span>
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Articles (shooting studio uniquement) */}
          {type === "shooting_studio" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Articles ({selectedArticleIds.length} sélectionné{selectedArticleIds.length > 1 ? "s" : ""})
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                {articles.map((a) => {
                  const isLost = a.statut === "perdu";
                  return (
                    <label
                      key={a.article_id}
                      className={`flex items-center gap-3 px-3 py-2 ${isLost ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArticleIds.includes(a.article_id)}
                        onChange={() => toggleArticle(a.article_id)}
                        disabled={isLost}
                        className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-sm flex-1">
                        <span className="font-mono text-xs text-gray-400 mr-2">{a.reference}</span>
                        {a.name}
                      </span>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${
                        a.statut === "disponible" ? "bg-green-100 text-green-700"
                        : a.statut === "deteriore" ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {a.statut}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Décors (shooting décor uniquement) */}
          {type === "shooting_decor" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Décors ({selectedDecorIds.length} sélectionné{selectedDecorIds.length > 1 ? "s" : ""})
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                {decors.map((d) => (
                  <label
                    key={d.decor_id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDecorIds.includes(d.decor_id)}
                      onChange={() => toggleDecor(d.decor_id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/planning")}
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

export default EventForm;