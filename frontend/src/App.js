import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
