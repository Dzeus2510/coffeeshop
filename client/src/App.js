import axios from "axios";
import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./helpers/AuthContext";
import Cafe from "./pages/Cafe";
import ChangePassword from "./pages/ChangePassword";
import CreateCoffee from "./pages/CreateCoffee";
import Favourite from "./pages/Favourite";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import Registration from "./pages/Registration";

function Root() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  let nav = useNavigate()

  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/auth", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (!localStorage.getItem("accessToken")) {
          setAuthState({ username: "", id: 0, status: false });
        } else {
          const updatedAuthState = {
            username: response.data.username,
            id: response.data.id,
            status: true,
          };
          setAuthState(updatedAuthState);
          // Store the updated status in local storage
          localStorage.setItem("authStatus", JSON.stringify(updatedAuthState));
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
          <div className="navbar">
            <div className="links">
              {!authState.status ? (
                <>
                  <Link to="/login"> Login</Link>
                  <Link to="/registration"> Registration</Link>
                </>
              ) : (
                <>
                  <Link to="/"> HomePage</Link>
                  <Link to="/favourite">Favourite</Link>
                  <Link to="/createshop">Create</Link>
                </>
              )}
            </div>
            <div className="loggedInContainer">
              <h1 onClick={() =>  nav(`/profile/${authState.id}`)}>{authState.username} </h1>
              <nav/>
              {authState.status && <Link to="/login"><button onClick={logout}> Logout</button></Link>}
            </div>
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cafe/:id" element={<Cafe />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/createshop" element={<CreateCoffee />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/favourite" element={<Favourite />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
      </AuthContext.Provider>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Root />
    </Router>
  );
}

export default App;
