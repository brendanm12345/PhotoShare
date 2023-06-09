import React from "react";
import {
  List,
  ListItemAvatar,
  Typography,
  Avatar,
} from "@mui/material";
import { withRouter, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import { cs142models } from "../../modelData/photoApp";
import { spacing } from "@mui/system";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: undefined,
    };
  }

  componentDidMount() {
    let url = "http://localhost:3000/user/list";
    axios.get(url).then(
      (response) => {
        this.setState({ userList: response.data });
        console.log("ANY", response.data);
        // this.props.updateView(`${first_name} ${last_name}`);
      },
      (err) =>
        console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
    );
  }

  handleUserSelection = (user) => {
    this.props.setUser(user);
  };

  render() {
    const { userList } = this.state;

    if (!userList) {
      return null; // or render a loading indicator
    }

    return (
      <div>
        <List component="nav">
          {userList.map((user) => (
            <Link
              to={`/users/${user._id}`}
              key={user._id}
              onClick={() => this.handleUserSelection(user)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                color: "black",
                padding: "4px",
                paddingVertical: "8px",
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "black", fontSize: 14 }}>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </Avatar>
              </ListItemAvatar>
              <div>
                <Typography variant="subtitle1">
                  {user.first_name} {user.last_name}
                </Typography>
                {/* <Typography variant="body1">{user.location}</Typography> */}
              </div>
            </Link>
          ))}
        </List>
      </div>
    );
  }
}

export default withRouter(UserList);
