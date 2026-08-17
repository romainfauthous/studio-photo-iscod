const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./../models/userModel");
const Log = require("./../models/logModel");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Vérifier que les champs sont présents
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // 2. Chercher l'utilisateur en base
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Log d'échec
      await Log.create({ 
        action: "LOGIN_FAILED",
        email,
        user_id: null,
        role: null
      });
      // Message volontairement vague (on ne dit pas si c'est l'email ou le mdp qui est faux)
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    // 3. Comparer le mot de passe fourni avec le hash stocké
    const motDePasseValide = await bcrypt.compare(password, user.password);
    if (!motDePasseValide) {
      await Log.create({ 
        action: "LOGIN_FAILED",
        email,
        user_id: null,
        role: null
      });
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    // 4. Générer le token JWT (valable 8h)
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role }, // données mises dans le token
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 5. Log réussi + Renvoyer le token + infos non sensibles
    await Log.create({ 
      action: "LOGIN_SUCCESS",
      email,
      user_id: user.user_id,
      role: user.role
    });

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        first_name: user.first_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur login :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { login };