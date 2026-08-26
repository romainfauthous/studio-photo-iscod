import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">Studio Photo</span>

          {/* Liens de navigation */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Accueil
            </Link>
            <Link to="/users" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Prestataires
            </Link>
            <Link to="/places" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Lieux
            </Link>
            <Link to="/articles" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Articles
            </Link>
            <Link to="/decors" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Décors
            </Link>
            <Link to="/planning" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Planning
            </Link>
            <Link to="/validations" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Validations
            </Link>
            <Link to="/history" className="text-sm text-gray-600 hover:text-blue-600 px-2 py-1">
              Historiques
            </Link>
          </div>

          {/* Utilisateur + déconnexion */}
          <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-gray-500">
                    {user?.first_name}
                </span>
                <button onClick={handleLogout} className="text-sm bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 transition cursor-pointer">
                    Déconnexion
                </button>
          </div>
        </nav>
      </header>

      {/* Le contenu de la page s'affiche ici */}
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default Layout;