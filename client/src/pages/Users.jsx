import { useState, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);      // la liste (vide au départ)
    const [loading, setLoading] = useState(true); // en cours de chargement ?
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fonction de chargement, réutilisable
    async function fetchUsers() {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
            setError("");
        } catch (err) {
            console.error("Erreur chargement prestataires :", err);
            setError("Impossible de charger les prestataires.");
        } finally {
            setLoading(false);
        }
    }

    // Au chargement de la page
    useEffect(() => {
        fetchUsers();
    }, []);

    async function handleDelete(userId, userName) {
        // Confirmation avant d'agir (évite les suppressions accidentelles)
        const confirmed = window.confirm(`Supprimer le prestataire ${userName} ?`);
        if (!confirmed) return;

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers(); // on recharge la liste à jour
        } catch (err) {
            console.error("Erreur suppression :", err);
            alert("La suppression a échoué.");
        }
    }

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Prestataires</h1>
                    <button onClick={() => navigate("/users/new")} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition cursor-pointer">
                        + Ajouter
                    </button>
            </div>

            {/* 3 états possibles : chargement / erreur / données */}
            {loading && <p className="text-gray-500">Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* overflow-x-auto : le tableau défile horizontalement sur mobile */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-left">
                        <tr>
                        <th className="px-4 py-3 font-medium">Nom</th>
                        <th className="px-4 py-3 font-medium">Prénom</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Rôle</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                        <tr key={u.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{u.name}</td>
                            <td className="px-4 py-3">{u.first_name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                                <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => navigate(`/users/${u.user_id}/edit`)} className="text-sm text-blue-600 hover:text-blue-800 hover:underline mr-4 cursor-pointer">
                                    Modifier
                                </button>
                                <button onClick={() => handleDelete(u.user_id, `${u.first_name} ${u.name}`)} className="text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer">
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            )}
        </Layout>
    );
}

export default Users;