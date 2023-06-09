"use strict";

import React, { useState } from "react";
import { TextField, Typography, Button } from "@mui/material";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";

function LoginRegister({ setUser, setLoggedInAs }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    let url = "http://localhost:3000/admin/login";
    axios
      .post(url, { login_name: username, password })
      .then((response) => {
        setUsername("");
        setPassword("");
        setSuccess(true);
        let user = response.data;
        setLoggedInAs(user);
        setUser(user);
        window.location = "#/users/" + user._id;
        // nav to user detail view
      })
      .catch((err) => {
        setErr(err);
        console.error(err);
        setUsername("");
        setPassword("");
        console.log("Couldn't find account with username " + username + ".");
      });
  };

  const isValid = () => {
    return username.length > 0 && password.length > 0;
  };

  return (
    // success?
    <ThemeProvider theme={theme}>
      {success ? (
        <div>
          <Typography>You're logged in!</Typography>
          <a href="#/">Go to Home</a>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
            maxWidth: 500,
          }}
        >
          <Typography variant="h5" style={{ marginBottom: 12 }}>
            Log in to Photo App
          </Typography>
          <TextField
            margin="normal"
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            label="Username"
            variant="outlined"
            style={{ marginBottom: 12 }}
          />
          <TextField
            margin="normal"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            label="Password"
            variant="outlined"
            style={{ marginBottom: 12 }}
          />
          <Typography variant="body">
            Don't have an account? <a href="#/signup">Sign up now</a>
          </Typography>
          <br></br>
          <Typography color="red" variant="caption">
            {err}
          </Typography>
          <Button
            size="large"
            color="primary"
            disabled={!isValid()}
            onClick={handleSubmit}
            variant={"contained"}
          >
            Log In
          </Button>
        </div>
      )}
    </ThemeProvider>
  );
}

export default LoginRegister;
