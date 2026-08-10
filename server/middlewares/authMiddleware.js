const jwt = require("jsonwebtoken");

// Vérifie que la requête contient un token JWT valide
function verifyToken(req, res, next) {
  // 1. Récupérer le token dans l'en-tête "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1]; // on enlève le mot "Bearer "
  if (!token) {
    return res.status(401).json({ message: "Token mal formé" });
  }

  // 2. Vérifier que le token est valide (signé avec NOTRE secret, pas expiré)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // on attache les infos du token à la requête (user_id, role)
    next();             // tout est bon -> on laisse passer vers la suite
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = { verifyToken };
