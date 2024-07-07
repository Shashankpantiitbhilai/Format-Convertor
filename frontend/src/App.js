import "./App.css";
import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter } from "react-router-dom";
import Main from "./main";
import { fetchCredentials } from "./services/auth";

const AdminContext = createContext();

function App() {
  const [IsUserLoggedIn, setIsUserLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCredentials().then((User) => {
      if (User) {
        setIsUserLoggedIn(User);
      }
      setIsLoading(false); // Set loading to false after fetching credentials
    });
  }, []);

  return (
    <AdminContext.Provider value={{ IsUserLoggedIn, setIsUserLoggedIn, isLoading }}>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </AdminContext.Provider>
  );
}

export { AdminContext };
export default App;
