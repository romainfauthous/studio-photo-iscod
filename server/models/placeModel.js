const db = require("./../config/db");

async function findAll() {
  const [rows] = await db.query(
    "SELECT place_id, name, adress, type FROM `place` ORDER BY name ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT place_id, name, adress, type FROM `place` WHERE place_id = ?",
    [id]
  );
  return rows[0];
}

async function create(place) {
  const { name, adress, type } = place;
  const [result] = await db.query(
    "INSERT INTO `place` (name, adress, type) VALUES (?, ?, ?)",
    [name, adress, type]
  );
  return result.insertId;
}

async function update(id, place) {
  const { name, adress, type } = place;
  await db.query(
    "UPDATE `place` SET name = ?, adress = ?, type = ? WHERE place_id = ?",
    [name, adress, type, id]
  );
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM `place` WHERE place_id = ?", [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, remove };