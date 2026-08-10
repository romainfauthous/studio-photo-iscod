const db = require("./../config/db");

// Cherche un utilisateur par son email
async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM `user` WHERE email = ?",
    [email]
  );
  return rows[0]; // le 1er résultat, ou undefined si aucun
}


// READ
async function findAll() {
  const [rows] = await db.query(
    "SELECT user_id, name, first_name, phone, email, role FROM `user` ORDER BY name ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT user_id, name, first_name, phone, email, role FROM `user` WHERE user_id = ?",
    [id]
  );
  return rows[0];
}


// CREATE
async function create(user) {
  const { name, first_name, phone, email, password, role } = user;
  const [result] = await db.query(
    "INSERT INTO `user` (name, first_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",
    [name, first_name, phone, email, password, role]
  );
  return result.insertId;
}

// UPDATE
async function update(id, { name, first_name, phone, email, role }) {
  await db.query(
    "UPDATE `user` SET name = ?, first_name = ?, phone = ?, email = ?, role = ? WHERE user_id = ?",
    [name, first_name, phone, email, role, id]
  );
}
// Uniquement le password
async function updatePassword(id, hash) {
  await db.query("UPDATE `user` SET password = ? WHERE user_id = ?", [hash, id]);
}

// "remove" et non "delete" : delete est un mot réservé de JavaScript
async function remove(id) {
  const [result] = await db.query("DELETE FROM `user` WHERE user_id = ?", [id]);
  return result.affectedRows; // 1 si supprimé, 0 si rien trouvé
}


module.exports = { findByEmail, findAll, findById, create, update, updatePassword, remove };