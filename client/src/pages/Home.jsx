import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";

function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bienvenue, {user?.first_name} !
        </h1>
        <p className="text-gray-600">
          Connecté en tant que <strong>{user?.role}</strong>.
        </p>
      </div>
    </Layout>
  );
}

export default Home;