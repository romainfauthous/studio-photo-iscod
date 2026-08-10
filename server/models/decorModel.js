const db = require("./../config/db");

async function findAll() {
  const [rows] = await db.query(
    "SELECT decor_id, name, description FROM `decor` ORDER BY name ASC"
  );
  return rows;
}

// Récupère un décor AVEC la liste de ses articles (2 requêtes)
async function findById(id) {
  const [decorRows] = await db.query(
    "SELECT decor_id, name, description FROM `decor` WHERE decor_id = ?",
    [id]
  );
  const decor = decorRows[0];
  if (!decor) return undefined;

  // On va chercher les articles liés via la table de liaison
  const [articles] = await db.query(
    `SELECT a.article_id, a.reference, a.name, a.statut
     FROM article a
     JOIN decor_article da ON da.article_id = a.article_id
     WHERE da.decor_id = ?`,
    [id]
  );
  decor.articles = articles; // on attache la liste au décor
  return decor;
}

// Création AVEC transaction (décor + liaisons dans decor_article)
async function create({ name, description, article_ids }) {
  const connection = await db.getConnection(); // on emprunte une connexion dédiée
  try {
    await connection.beginTransaction();

    // 1. Créer le décor
    const [result] = await connection.query(
      "INSERT INTO `decor` (name, description) VALUES (?, ?)",
      [name, description]
    );
    const decorId = result.insertId;

    // 2. Créer les liaisons decor_article (une par article)
    for (const articleId of article_ids) {
      await connection.query(
        "INSERT INTO `decor_article` (decor_id, article_id) VALUES (?, ?)",
        [decorId, articleId]
      );
    }

    await connection.commit(); // tout a réussi → on valide
    return decorId;
  } catch (error) {
    await connection.rollback(); // une erreur → on annule TOUT
    throw error; // on relance pour que le controller le sache
  } finally {
    connection.release(); // on rend la connexion au pool, quoi qu'il arrive
  }
}

// Mise à jour AVEC transaction : on remplace le décor ET toute sa composition
async function update(id, { name, description, article_ids }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Mettre à jour les infos du décor
    await connection.query(
      "UPDATE `decor` SET name = ?, description = ? WHERE decor_id = ?",
      [name, description, id]
    );

    // 2. Supprimer TOUTES les liaisons actuelles de ce décor
    await connection.query(
      "DELETE FROM `decor_article` WHERE decor_id = ?",
      [id]
    );

    // 3. Réinsérer la nouvelle liste complète d'articles
    for (const articleId of article_ids) {
      await connection.query(
        "INSERT INTO `decor_article` (decor_id, article_id) VALUES (?, ?)",
        [id, articleId]
      );
    }

    await connection.commit(); // tout a réussi → on valide
    return true;
  } catch (error) {
    await connection.rollback(); // une erreur → on annule TOUT
    throw error;
  } finally {
    connection.release(); // on rend la connexion, quoi qu'il arrive
  }
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM `decor` WHERE decor_id = ?", [id]);
  return result.affectedRows;
  // Rappel : grâce au CASCADE, les lignes decor_article liées partent automatiquement
}

module.exports = { findAll, findById, create, update, remove };