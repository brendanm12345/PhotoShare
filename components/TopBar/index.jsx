import React, { setState } from "react";
import { AppBar, Grid, Toolbar, Typography, Button } from "@mui/material";
import axios from "axios";

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
      <AppBar
        color="primary"
        className="cs142-topbar-appBar"
        position="absolute"
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
                <Button variant="contained" onClick={(event) => this.handleUpload(event)}>
                  Post
                </Button>
              )}
              <Typography variant="h6">{this.state.currView}</Typography>

              {this.showLogOut() && (
                <Button
                  color="inherit"
                  variant="outlined"
                  style={{ marginLeft: 16 }}
                  onClick={this.handleLogout}
                >
                  Log out
                </Button>
              )}
            </div>
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
