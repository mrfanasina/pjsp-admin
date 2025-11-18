import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./utils/Loader"; // ton composant de chargement
import "./App.css";
import DocumentPage from "./components/DocumentPage";
// ✅ Lazy load des pages pour de meilleures performances
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const ParametresPage = React.lazy(() => import("./pages/ParametresPage"));
const PensionsPages = React.lazy(() => import("./pages/PensionsPages"));
const ServicesPage = React.lazy(() => import("./pages/ServicesPage"));
const SoldesPage = React.lazy(() => import("./pages/SoldesPage"));
const NotFound = React.lazy(() => import("./components/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/parametres" element={<ParametresPage />} />
          <Route path="/pensions" element={<PensionsPages />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/soldes" element={<SoldesPage />} />
          <Route path="/add" element={<DocumentPage />} />

          {/* fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
