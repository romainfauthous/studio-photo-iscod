import { useState, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

function Validations() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    async function fetchEvents() {
        try {
            const response = await api.get("/events");
            // On charge les détails complets (avec articles, décors, users) pour chaque event
            const detailed = await Promise.all(
            response.data.map((e) => api.get(`/events/${e.event_id}`).then((r) => r.data))
            );
            setEvents(detailed);
            setError("");
        } catch (err) {
            console.error("Erreur chargement events :", err);
            setError("Impossible de charger les événements.");
        } finally {
            setLoading(false);
        }
    }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleValidation(eventId, type, targetId, action, currentValue) {
    try {
      const endpoint =
        type === "article"
          ? `/events/${eventId}/articles/${targetId}/validate-picture`
          : action === "picture"
          ? `/events/${eventId}/decors/${targetId}/validate-picture`
          : action === "install"
          ? `/events/${eventId}/decors/${targetId}/validate-install`
          : `/events/${eventId}/decors/${targetId}/validate-uninstall`;

      await api.patch(endpoint, { validated: !currentValue });
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue.";
      alert(msg);
    }
  }

  // Filtre : un prestataire ne voit que ses events
  const isAdmin = user?.role === "admin";
  const isPhotographer = ["photographe", "assistant_photographe"].includes(user?.role);
  const isDecorator = ["decorateur", "assistant_decorateur"].includes(user?.role);

  const visibleEvents = events.filter((e) => {
    if (e.type === "prepa_decor" || e.type === "retrait_decor") return false;
    if (!isAdmin && !e.users?.some((u) => u.user_id === user?.user_id)) return false;
    return (e.articles?.length > 0 || e.decors?.length > 0);
    });

  function ValidationButton({ validated, onClick, label }) {
    return (
      <button
        onClick={onClick}
        className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer transition ${
          validated
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {validated ? `✓ ${label}` : `○ ${label}`}
      </button>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Validations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connecté en tant que <strong>{user?.role}</strong>
        </p>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && visibleEvents.length === 0 && (
        <p className="text-gray-500">Aucun événement à valider.</p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {visibleEvents.map((event) => (
            <div key={event.event_id} className="bg-white rounded-xl shadow-sm p-5">
              {/* En-tête event */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-800">
                    {TYPE_LABELS[event.type]}
                  </span>
                  <span className="text-sm text-gray-400 ml-3">
                    {new Date(event.start_date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{event.place?.name}</span>
              </div>

              {/* Articles à valider — photographes + admin */}
              {(isAdmin || isPhotographer) &&
                event.articles?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Articles photographiés
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.articles.map((a) => (
                        <div key={a.article_id} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{a.name}</span>
                          <ValidationButton
                            validated={a.picture_validated}
                            label="Photo"
                            onClick={() =>
                              handleValidation(
                                event.event_id,
                                "article",
                                a.article_id,
                                "picture",
                                a.picture_validated
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Décors à valider */}
              {event.decors?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Décors
                  </p>
                  <div className="flex flex-col gap-3">
                    {event.decors.map((d) => (
                      <div key={d.decor_id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{d.name}</span>
                        <div className="flex gap-2">
                          {/* Photo décor — photographes + admin */}
                          {(isAdmin || isPhotographer) && (
                            <ValidationButton
                              validated={d.picture_validated}
                              label="Photo"
                              onClick={() =>
                                handleValidation(
                                  event.event_id,
                                  "decor",
                                  d.decor_id,
                                  "picture",
                                  d.picture_validated
                                )
                              }
                            />
                          )}
                          {/* Install + désinstall — décorateurs + admin */}
                          {(isAdmin || isDecorator) && (
                            <>
                              <ValidationButton
                                validated={d.install_validated}
                                label="Install"
                                onClick={() =>
                                  handleValidation(
                                    event.event_id,
                                    "decor",
                                    d.decor_id,
                                    "install",
                                    d.install_validated
                                  )
                                }
                              />
                              <ValidationButton
                                validated={d.uninstall_validated}
                                label="Désinstall"
                                onClick={() =>
                                  handleValidation(
                                    event.event_id,
                                    "decor",
                                    d.decor_id,
                                    "uninstall",
                                    d.uninstall_validated
                                  )
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Validations;