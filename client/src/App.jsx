import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import Places from "./pages/Places";
import PlaceForm from "./pages/PlaceForm";
import Articles from "./pages/Articles";
import ArticleForm from "./pages/ArticleForm";
import Decors from "./pages/Decors";
import DecorForm from "./pages/DecorForm";
import Planning from "./pages/Planning";
import EventForm from "./pages/EventForm";
import Validations from "./pages/Validations";
import History from "./pages/History";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/users/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
      <Route path="/users/:id/edit" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
      <Route path="/places" element={<ProtectedRoute><Places /></ProtectedRoute>} />
      <Route path="/places/new" element={<ProtectedRoute><PlaceForm /></ProtectedRoute>} />
      <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
      <Route path="/articles/new" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
      <Route path="/articles/:id/edit" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
      <Route path="/places/:id/edit" element={<ProtectedRoute><PlaceForm /></ProtectedRoute>} />
      <Route path="/decors" element={<ProtectedRoute><Decors /></ProtectedRoute>} />
      <Route path="/decors/new" element={<ProtectedRoute><DecorForm /></ProtectedRoute>} />
      <Route path="/decors/:id/edit" element={<ProtectedRoute><DecorForm /></ProtectedRoute>} />
      <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
      <Route path="/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
      <Route path="/validations" element={<ProtectedRoute><Validations /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;