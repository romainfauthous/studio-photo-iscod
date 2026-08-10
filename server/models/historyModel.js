const db = require("./../config/db");

// 1. Historique global des jours de travail (événements déjà réalisés)
async function getWorkHistory() {
  const [rows] = await db.query(
    `SELECT e.event_id, e.start_date, e.end_date, e.type, p.name AS place_name
     FROM \`event\` e
     JOIN place p ON p.place_id = e.place_id
     WHERE e.end_date < NOW()
     ORDER BY e.start_date DESC`
  );
  return rows;
}

// 2. Historique des jours de travail PAR prestataire (pour la facturation)
async function getWorkHistoryByUser(userId) {
  const [rows] = await db.query(
    `SELECT e.event_id, e.start_date, e.end_date, e.type, p.name AS place_name
     FROM \`event\` e
     JOIN place p ON p.place_id = e.place_id
     JOIN event_user eu ON eu.event_id = e.event_id
     WHERE eu.user_id = ? AND e.end_date < NOW()
     ORDER BY e.start_date DESC`,
    [userId]
  );
  return rows;
}

// 3. Historique des articles photographiés (picture_validated = TRUE)
async function getPhotographedArticles() {
  const [rows] = await db.query(
    `SELECT a.article_id, a.reference, a.name,
            e.event_id, e.start_date,
            u.name AS validated_by_name, u.first_name AS validated_by_first_name
     FROM event_article ea
     JOIN article a ON a.article_id = ea.article_id
     JOIN \`event\` e ON e.event_id = ea.event_id
     LEFT JOIN \`user\` u ON u.user_id = ea.validated_by
     WHERE ea.picture_validated = TRUE AND e.end_date < NOW()
     ORDER BY e.start_date DESC`
  );
  return rows;
}

// 4. Historique des décors photographiés
async function getPhotographedDecors() {
  const [rows] = await db.query(
    `SELECT d.decor_id, d.name,
            e.event_id, e.start_date,
            u.name AS validated_by_name, u.first_name AS validated_by_first_name
     FROM event_decor ed
     JOIN decor d ON d.decor_id = ed.decor_id
     JOIN \`event\` e ON e.event_id = ed.event_id
     LEFT JOIN \`user\` u ON u.user_id = ed.validated_by
     WHERE ed.picture_validated = TRUE AND e.end_date < NOW()
     ORDER BY e.start_date DESC`
  );
  return rows;
}

module.exports = {
  getWorkHistory,
  getWorkHistoryByUser,
  getPhotographedArticles,
  getPhotographedDecors,
};