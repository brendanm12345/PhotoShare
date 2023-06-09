"use strict";

import React, { setState } from "react";
import { AppBar, Grid, Toolbar, Typography, Button } from "@mui/material";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BarInfo: props.BarInfo,
      currView: props.currView,
      uploaded: false,
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currView !== this.props.currView) {
      this.setState({ currView: this.props.currView });
    }
    console.log("CURR", this.state.currView);
  }

  handleLogout() {
    const url = "http://localhost:3000/admin/logout";
    axios.post(url, {}).then(() => {
      this.props.setUser("");
      this.props.setCurrView("Please log in");
    });
  }

  showLogOut = () => {
    return this.state.currView !== "Please log in";
  };

  handleUpload = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => console.log(`POST ERR: ${err}`));
    }
  };

  render() {
    return (
      <ThemeProvider theme={theme}>
        <AppBar
          color="neutral"
          elevation="0"
          className="cs142-topbar-appBar"
          style={{ borderBottom: "1px solid #000" }}
          position="fixed"
        >
          <Toolbar className="cs142-topbar-toolbar">
            <Grid
              container
              justify="center"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h4">Brendan McLaughlin</Typography>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {this.showLogOut() && (
                  <input
                    type="file"
                    accept="image/*"
                    onClick={() => this.setState({ uploaded: true })}
                    ref={(domFileRef) => {
                      this.uploadInput = domFileRef;
                    }}
                  />
                )}
                {this.state.uploaded && (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(event) => this.handleUpload(event)}
                  >
                    Post
                  </Button>
                )}
                <Typography variant="subtitle1">
                  {this.state.currView}
                </Typography>

                {this.showLogOut() && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      style={{
                        textDecoration: "none",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        color: "black",
                        padding: 5,
                        paddingLeft: 8,
                        paddingRight: 8,
                        marginLeft: 12,
                        borderRadius: 4,
                        transition: 'background-color 0.1s',
                      }}
                      onMouseOver={(event) => {
                        event.currentTarget.style.backgroundColor =
                          "rgba(0, 0, 0, 0.05)";
                      }}
                      onMouseOut={(event) => {
                        event.currentTarget.style.backgroundColor =
                          "transparent";
                      }}
                      to="/favorites"
                    >
                      <FavoriteIcon color="black"></FavoriteIcon>
                      <Typography style={{ marginLeft: 4 }} variant="subtitle1">
                        Favorites
                      </Typography>
                    </Link>
                    <Button
                      color="inherit"
                      variant="outlined"
                      style={{ marginLeft: 12 }}
                      onClick={this.handleLogout}
                    >
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </Grid>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    );
  }
}

export default TopBar;
