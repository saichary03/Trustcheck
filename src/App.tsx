import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Result from "./pages/Result";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-emerald-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}
