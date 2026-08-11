// Vérifie que l'utilisateur authentifié a l'un des rôles autorisés.
// À placer APRÈS verifyToken (pcq c'est lui qui remplit req.user).
function verifyRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    next();
  };
}

module.exports = { verifyRole };