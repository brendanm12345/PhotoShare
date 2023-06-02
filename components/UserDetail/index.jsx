import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.fetchUserData(this.props.userId);
  }

  componentDidUpdate(prevProps) {
    const oldUserId = prevProps.userId;
    const newUserId = this.props.userId;
    if (oldUserId !== newUserId) {
      this.fetchUserData(newUserId);
    }
  }

  fetchUserData = (userId) => {
    const url = `http://localhost:3000/user/${userId}`;
    axios.get(url)
      .then((response) => {
        let { first_name, last_name } = response.data;
        this.setState({ user: response.data });
        this.props.updatecurrView(`${first_name} ${last_name}`);
      })
      .catch((err) =>
        console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
      );
  };

  render() {
    const { user } = this.state;
    if (!user) {
      return <Typography variant="body1">Loading user details...</Typography>;
    }

    return (
      <div>
        <Typography variant="h2" component="div" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {user.location} &bull; {user.occupation}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {user.description}
        </Typography>
        <Link to={`/photos/${user._id}`}>View Photos</Link>
      </div>
    );
  }
}

export default UserDetail;
