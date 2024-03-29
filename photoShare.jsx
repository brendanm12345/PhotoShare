import React, { useState, componentDidMount } from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, withRouter } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import Favorites from "./components/Favorites";
import LoginRegister from "./components/LoginRegister";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

function PhotoShare() {
  const [user, setUser] = useState("");
  const [loggedInAs, setLoggedInAs] = useState("");
  const [currView, setCurrView] = useState("Please log in");
  const [selectedUserId, setSelectedUserId] = useState("");

  const isLoggedIn = () => {
    console.log(!(user == ""));
    // return true;
    return !(user == "");
  };

  componentDidMount = () => {
    if (user == "") {
      setCurrView("Please Login");
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              currView={currView}
              setCurrView={setCurrView}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
            />
          </Grid>
          <div className="cs142-main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="cs142-main-grid-item">
              {isLoggedIn() && <UserList setUser={setUser} />}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper
              className="cs142-main-grid-item"
              style={{ minHeight: "88vh", height: "auto" }}
            >
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() =>
                    isLoggedIn() ? (
                      <Redirect to={`/users/${user._id}`} />
                    ) : (
                      <Redirect to="/login" />
                    )
                  }
                />
                <Route
                  exact
                  path="/login"
                  render={(props) => (
                    <LoginRegister
                      setUser={setUser}
                      // not added to login reg yet
                      setCurrView={setCurrView}
                      setLoggedInAs={setLoggedInAs}
                      {...props}
                    />
                  )}
                />
                {isLoggedIn() ? (
                  <Route
                    path="/favorites"
                    render={(props) => (
                      <Favorites
                        {...props}
                        userId={user._id}
                        updatecurrView={setCurrView}
                      />
                    )}
                  />
                ) : (
                  <Redirect path="/favorites" to="/login" />
                )}
                {isLoggedIn() ? (
                  <Route
                    path={`/users/:userId`}
                    render={(props) => (
                      <UserDetail
                        {...props}
                        userId={user._id}
                        updatecurrView={setCurrView}
                      />
                    )}
                  />
                ) : (
                  <Redirect path={`/users/:id`} to="/login" />
                )}
                {isLoggedIn() ? (
                  <Route
                    path={`/photos/${user._id}`}
                    render={(props) => (
                      <UserPhotos
                        {...props}
                        userId={user._id}
                        updatecurrView={setCurrView}
                        loggedInAs={loggedInAs}
                      />
                    )}
                  />
                ) : (
                  <Redirect path={`/photos/:id`} to="/login" />
                )}
              </Switch>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
