import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import api from "../services/api";
import Layout from "../components/Layout";
import EventModal from "../components/EventModal";

const TYPE_COLORS = {
  shooting_studio: "#2563eb",
  shooting_decor: "#7c3aed",
  prepa_decor: "#ea580c",
  retrait_decor: "#6b7280",
};

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

function Planning() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const navigate = useNavigate();

  // Au clic sur un event : on charge ses détails complets
  async function handleEventClick(info) {
    try {
      const response = await api.get(`/events/${info.event.id}`);
      setSelectedEvent(response.data);
    } catch (err) {
      console.error("Erreur chargement event :", err);
    }
  }

  // Suppression d'un event
  async function handleDelete(eventId) {
    if (!window.confirm("Supprimer cet événement ?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      setSelectedEvent(null);
      setCalendarKey((k) => k + 1); // force le rechargement du calendrier
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("La suppression a échoué.");
    }
  }

    // Fonction utilitaire pour convertir ISO → format MySQL
    function toMySQLDate(isoString) {
      // Retire le Z et les millisecondes, remplace T par espace
      return isoString.replace("T", " ").replace("Z", "").split(".")[0];
    }

    async function handleEventDrop(info) {
        try {
            // 1. Charger l'event complet depuis l'API
            const response = await api.get(`/events/${info.event.id}`);
            const existing = response.data;

            // 2. Construire le payload avec les nouvelles dates + tout le reste
            const payload = {
                start_date: toMySQLDate(info.event.start.toISOString()),
                end_date: info.event.end
                    ? toMySQLDate(info.event.end.toISOString())
                    : toMySQLDate(info.event.start.toISOString()),
                type: existing.type,
                place_id: existing.place_id,
                user_ids: existing.users.map((u) => u.user_id),
            };

            // On n'ajoute article_ids que s'il y en a
            if (existing.articles?.length > 0) {
            payload.article_ids = existing.articles.map((a) => a.article_id);
            }

            // On n'ajoute decor_ids que s'il y en a
            if (existing.decors?.length > 0) {
            payload.decor_ids = existing.decors.map((d) => d.decor_id);
            }

            // 3. Envoyer le PUT avec tout
            await api.put(`/events/${info.event.id}`, payload);
        } catch (err) {
            console.error("Erreur du déplacement de l'event :", err);
            info.revert();
            alert("Le déplacement a échoué.");
        }
    }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Planning</h1>
        <button
          onClick={() => navigate("/events/new")}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
        >
          + Ajouter
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <FullCalendar
          key={calendarKey}
          plugins={[themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventSources={[
            {
              events: async () => {
                try {
                  const response = await api.get("/events");
                  return response.data.map((e) => ({
                    id: e.event_id,
                    title: TYPE_LABELS[e.type],
                    start: e.start_date,
                    end: e.end_date,
                    color: TYPE_COLORS[e.type],
                  }));
                } catch (err) {
                  console.error("Erreur chargement events :", err);
                  return [];
                }
              },
            },
          ]}
          eventClick={handleEventClick}
          height="auto"
          eventClassNames="cursor-pointer"
          editable={true}
          eventDrop={handleEventDrop}
        />
      </div>

      {/* Modale de détail */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDelete}
        />
      )}
    </Layout>
  );
}

export default Planning;