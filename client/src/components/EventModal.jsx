import { useNavigate } from "react-router-dom";

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

function EventModal({ event, onClose, onDelete }) {
  const navigate = useNavigate();

  if (!event) return null;

  // Formatage de la date pour affichage lisible
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    // Fond semi-transparent qui ferme la modale au clic
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      {/* La modale elle-même — on stoppe la propagation du clic */}
      <div
        className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {TYPE_LABELS[event.type]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Infos principales */}
        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Début</span>
            <p className="mt-0.5">{formatDate(event.start_date)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Fin</span>
            <p className="mt-0.5">{formatDate(event.end_date)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Lieu</span>
            <p className="mt-0.5">{event.place?.name || "—"}</p>
          </div>
        </div>

        {/* Prestataires */}
        {event.users && event.users.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">
              Prestataires ({event.users.length})
            </span>
            <ul className="mt-1 space-y-1">
              {event.users.map((u) => (
                <li key={u.user_id} className="text-sm text-gray-700">
                  {u.first_name} {u.name}
                  <span className="ml-2 text-xs text-gray-400">{u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Articles (shooting studio) */}
        {event.articles && event.articles.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">
              Articles ({event.articles.length})
            </span>
            <ul className="mt-1 space-y-1">
              {event.articles.map((a) => (
                <li key={a.article_id} className="text-sm text-gray-700">
                  <span className="font-mono text-xs text-gray-400 mr-2">{a.reference}</span>
                  {a.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Décors (shooting décor) */}
        {event.decors && event.decors.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">
              Décors ({event.decors.length})
            </span>
            <ul className="mt-1 space-y-1">
              {event.decors.map((d) => (
                <li key={d.decor_id} className="text-sm text-gray-700">
                  {d.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/events/${event.event_id}/edit`)}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(event.event_id)}
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition cursor-pointer"
          >
            Supprimer
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;