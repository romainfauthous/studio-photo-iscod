const db = require("./../config/db");

async function findAll() {
  const [rows] = await db.query(
    "SELECT article_id, reference, name, statut, notes FROM `article` ORDER BY name ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT article_id, reference, name, statut, notes FROM `article` WHERE article_id = ?",
    [id]
  );
  return rows[0];
}

// Pour vérifier l'unicité de la référence (comme findByEmail pour user)
async function findByReference(reference) {
  const [rows] = await db.query(
    "SELECT article_id, reference FROM `article` WHERE reference = ?",
    [reference]
  );
  return rows[0];
}

async function create(article) {
  const { reference, name, statut, notes } = article;
  const [result] = await db.query(
    "INSERT INTO `article` (reference, name, statut, notes) VALUES (?, ?, ?, ?)",
    [reference, name, statut, notes]
  );
  return result.insertId;
}

async function update(id, article) {
  const { reference, name, statut, notes } = article;
  await db.query(
    "UPDATE `article` SET reference = ?, name = ?, statut = ?, notes = ? WHERE article_id = ?",
    [reference, name, statut, notes, id]
  );
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM `article` WHERE article_id = ?", [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, findByReference, create, update, remove };