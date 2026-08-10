const mysql = require("mysql2");
require("dotenv").config();

// *************************************************************************************
// Sans "pool" => si deux requêtes arrivent en même temps (le gérant consulte le planning pendant qu'un photographe valide une photo), la deuxième requête doit attendre que la première soit finie. Une seule ligne = une file d'attente.
// Avec "pool" => Le pool, c'est un petit stock de lignes déjà ouvertes (chez nous, connectionLimit: 10). Quand une requête arrive, elle pioche une ligne libre, l'utilise, puis la rend au stock pour la suivante. Plusieurs requêtes peuvent donc être traitées en parallèle, sans rouvrir une ligne à chaque fois.
// *************************************************************************************

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// On exporte la version "promise" pour utiliser async/await partout.
module.exports = pool.promise();