const userModel = require("./../models/userModel");
const bcrypt = require("bcrypt");

async function getAllUsers(req, res) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error("Erreur getAllUsers :", error.message); // détail = serveur
    res.status(500).json({ message: "Erreur serveur." });  // générique = client
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params; // l'id vient de l'URL (/api/users/1)
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    res.json(user);
  } catch (error) {
    console.error("Erreur getUserById :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

// Les regex de validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.\-_])[A-Za-z\d@$!%*?&.\-_]{8,}$/;
const ALLOWED_ROLES = [
  "admin", "photographe", "assistant_photographe",
  "decorateur", "assistant_decorateur", "chauffeur_assistant",
];

async function createUser(req, res) {
  try {
    const { name, first_name, phone, email, password, role } = req.body;

    // --- 1. VALIDATION : présence des champs obligatoires ---
    if (!name?.trim() || !first_name?.trim() || !phone?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // --- 2. VALIDATION : format de l'email ---
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }

    // --- 3. VALIDATION : robustesse du mot de passe ---
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    // --- 4. VALIDATION : rôle autorisé ---
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    // --- 5. UNICITÉ : email déjà utilisé ?
    const existant = await userModel.findByEmail(email);
    if (existant) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // --- 6. SÉCURITÉ : hasher le mot de passe avant insertion ---
    const hash = await bcrypt.hash(password, 10);

    // --- 7. INSERTION ---
    const newId = await userModel.create({
      name: name.trim(),
      first_name: first_name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role,
    });

    // --- 8. RÉPONSE : 201 Created + l'id, jamais le mot de passe ---
    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user_id: newId,
    });
  } catch (error) {
    console.error("Erreur createUser :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}



// UPDATE USER
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, first_name, phone, email, password, role } = req.body;

    // 1. L'utilisateur existe-t-il ?
    const existing = await userModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // 2. Champs obligatoires (password EXCLU : il est optionnel en modification)
    if (!name?.trim() || !first_name?.trim() || !phone?.trim() || !email?.trim() || !role) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires (hors mot de passe)." });
    }
    // 3. Format email
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }
    // 4. Rôle autorisé
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    // 5. Si un password est fourni, on valide son format AVANT toute écriture
    if (password && !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial." });
    }
    // 6. Email déjà pris PAR UN AUTRE utilisateur ?
    const emailOwner = await userModel.findByEmail(email);
    if (emailOwner && emailOwner.user_id !== Number(id)) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // --- Écritures seulement après TOUTES les validations ---
    await userModel.update(id, {
      name: name.trim(),
      first_name: first_name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      role,
    });
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await userModel.updatePassword(id, hash);
    }

    // On renvoie l'utilisateur à jour (sans password, via findById)
    const updated = await userModel.findById(id);
    res.status(200).json({ message: "Utilisateur mis à jour.", user: updated });
  } catch (error) {
    console.error("Erreur updateUser :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

// DELETE / REMOVE
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const existing = await userModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    await userModel.remove(id);
    res.status(200).json({ message: "Utilisateur supprimé." });
  } catch (error) {
    console.error("Erreur deleteUser :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}
module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };