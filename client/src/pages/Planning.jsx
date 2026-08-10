import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
// import "@fullcalendar/react/themes/classic/theme.css";
// import "@fullcalendar/react/skeleton.css";
// import themePlugin from "@fullcalendar/react/themes/classic";
// import "@fullcalendar/react/themes/classic/palette.css";
import api from "../services/api";
import Layout from "../components/Layout";

// Couleur selon le type d'événement
const TYPE_COLORS = {
  shooting_studio: "#2563eb",
  shooting_decor: "#7c3aed",
  prepa_decor: "#ea580c",
  retrait_decor: "#6b7280",
};

// Libellé lisible pour l'affichage
const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

function Planning() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEvents() {
    try {
      const response = await api.get("/events");
      // On transforme les events de l'API au format attendu par FullCalendar
      const formatted = response.data.map((e) => ({
        id: e.event_id,
        title: TYPE_LABELS[e.type],
        start: e.start_date,
        end: e.end_date,
        color: TYPE_COLORS[e.type]
      }));
      setEvents(formatted);
      setError("");
    } catch (err) {
      console.error("Erreur chargement planning :", err);
      setError("Impossible de charger le planning.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Planning</h1>
      </div>

      {/* Légende des couleurs */}
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

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <FullCalendar
            plugins={[/* themePlugin */dayGridPlugin, timeGridPlugin /*interactionPlugin*/]}
            initialView="dayGridMonth"
            locale="fr"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            height="auto"
          />
        </div>
      )}
    </Layout>
  );
}

export default Planning;