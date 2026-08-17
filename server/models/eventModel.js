const db = require("../config/db");

async function findAll() {
  const [rows] = await db.query(
    "SELECT event_id, start_date, end_date, type, place_id FROM `event` ORDER BY start_date ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT e.event_id, e.start_date, e.end_date, e.type,
            p.place_id, p.name AS place_name, p.adress, p.type AS place_type
    FROM \`event\` e
    JOIN place p ON p.place_id = e.place_id
    WHERE e.event_id = ?`,
    [id]
  );
  const event = rows[0];
  if (!event) return undefined;
  
  event.place = {
    place_id: event.place_id,
    name: event.place_name,
    adress: event.adress,
    type: event.place_type,
  };

  delete event.place_name;
  delete event.adress;
  delete event.place_type;

  // Prestataires
  const [users] = await db.query(
    `SELECT u.user_id, u.name, u.first_name, u.role
     FROM \`user\` u
     JOIN event_user eu ON eu.user_id = u.user_id
     WHERE eu.event_id = ?`,
    [id]
  );
  event.users = users;

  // Articles (présents seulement pour un shooting_studio)
  const [articles] = await db.query(
    `SELECT a.article_id, a.reference, a.name, a.statut
     FROM article a
     JOIN event_article ea ON ea.article_id = a.article_id
     WHERE ea.event_id = ?`,
    [id]
  );
  event.articles = articles;

  // Décors (présents seulement pour un shooting_decor)
  const [decors] = await db.query(
    `SELECT d.decor_id, d.name, d.description
     FROM decor d
     JOIN event_decor ed ON ed.decor_id = d.decor_id
     WHERE ed.event_id = ?`,
    [id]
  );
  event.decors = decors;

  return event;
}

async function create({ start_date, end_date, type, place_id, user_ids, article_ids, decor_ids }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Créer l'événement
    const [result] = await connection.query(
      "INSERT INTO `event` (start_date, end_date, type, place_id) VALUES (?, ?, ?, ?)",
      [start_date, end_date, type, place_id]
    );
    const eventId = result.insertId;

    // 2. Affecter les prestataires
    for (const userId of user_ids) {
      await connection.query(
        "INSERT INTO `event_user` (event_id, user_id) VALUES (?, ?)",
        [eventId, userId]
      );
    }

    // 3. Rattacher les articles (shooting_studio uniquement)
    if (Array.isArray(article_ids)) {
      for (const articleId of article_ids) {
        await connection.query(
          "INSERT INTO `event_article` (event_id, article_id) VALUES (?, ?)",
          [eventId, articleId]
        );
      }
    }

    // 4. Rattacher les décors (shooting_decor uniquement)
    if (Array.isArray(decor_ids)) {
      for (const decorId of decor_ids) {
        await connection.query(
          "INSERT INTO `event_decor` (event_id, decor_id) VALUES (?, ?)",
          [eventId, decorId]
        );
      }
    }

    await connection.commit();
    return eventId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, { start_date, end_date, type, place_id, user_ids, article_ids, decor_ids }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Mettre à jour les infos de l'événement
    await connection.query(
      "UPDATE `event` SET start_date = ?, end_date = ?, type = ?, place_id = ? WHERE event_id = ?",
      [start_date, end_date, type, place_id, id]
    );

    // 2. Supprimer TOUTES les liaisons actuelles
    await connection.query("DELETE FROM `event_user` WHERE event_id = ?", [id]);
    await connection.query("DELETE FROM `event_article` WHERE event_id = ?", [id]);
    await connection.query("DELETE FROM `event_decor` WHERE event_id = ?", [id]);

    // 3. Réinsérer les prestataires
    for (const userId of user_ids) {
      await connection.query(
        "INSERT INTO `event_user` (event_id, user_id) VALUES (?, ?)",
        [id, userId]
      );
    }

    // 4. Réinsérer les articles (si fournis)
    if (Array.isArray(article_ids)) {
      for (const articleId of article_ids) {
        await connection.query(
          "INSERT INTO `event_article` (event_id, article_id) VALUES (?, ?)",
          [id, articleId]
        );
      }
    }

    // 5. Réinsérer les décors (si fournis)
    if (Array.isArray(decor_ids)) {
      for (const decorId of decor_ids) {
        await connection.query(
          "INSERT INTO `event_decor` (event_id, decor_id) VALUES (?, ?)",
          [id, decorId]
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM `event` WHERE event_id = ?", [id]);
  return result.affectedRows;
}

async function setArticlePictureValidation(eventId, articleId, userId, validated) {
  await db.query(
    `UPDATE \`event_article\`
     SET picture_validated = ?, validated_by = ?
     WHERE event_id = ? AND article_id = ?`,
    [validated, validated ? userId : null, eventId, articleId]
  );
}

async function setDecorPictureValidation(eventId, decorId, userId, validated) {
  await db.query(
    `UPDATE \`event_decor\`
     SET picture_validated = ?, validated_by = ?
     WHERE event_id = ? AND decor_id = ?`,
    [validated, validated ? userId : null, eventId, decorId]
  );
}

async function setDecorInstallValidation(eventId, decorId, userId, validated) {
  await db.query(
    `UPDATE \`event_decor\`
     SET install_validated = ?, validated_by = ?
     WHERE event_id = ? AND decor_id = ?`,
    [validated, validated ? userId : null, eventId, decorId]
  );
}

async function setDecorUninstallValidation(eventId, decorId, userId, validated) {
  await db.query(
    `UPDATE \`event_decor\`
     SET uninstall_validated = ?, validated_by = ?
     WHERE event_id = ? AND decor_id = ?`,
    [validated, validated ? userId : null, eventId, decorId]
  );
}

// Lire une ligne event_article (pour connaître l'état de validation actuel)
async function getEventArticle(eventId, articleId) {
  const [rows] = await db.query(
    "SELECT event_id, article_id, picture_validated FROM `event_article` WHERE event_id = ? AND article_id = ?",
    [eventId, articleId]
  );
  return rows[0];
}

// Lire une ligne event_decor (pour connaître l'état de validation actuel)
async function getEventDecor(eventId, decorId) {
  const [rows] = await db.query(
    "SELECT event_id, decor_id, picture_validated, install_validated, uninstall_validated FROM `event_decor` WHERE event_id = ? AND decor_id = ?",
    [eventId, decorId]
  );
  return rows[0];
}

module.exports = { findAll, findById, create, update, remove, setArticlePictureValidation, setDecorPictureValidation, setDecorInstallValidation, setDecorUninstallValidation, getEventArticle, getEventDecor };