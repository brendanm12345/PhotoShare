import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardMedia,
  IconButton,
  Button,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";

const UserDetail = ({ updatecurrView }) => {
  const [user, setUser] = useState(null);
  const [notablePosts, setNotablePosts] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserData = (id) => {
      const urlUser = `http://localhost:3000/user/${id}`;
      axios
        .get(urlUser)
        .then((response) => {
          let { first_name, last_name } = response.data;
          setUser(response.data);
          updatecurrView(`${first_name} ${last_name}`);
        })
        .catch((err) =>
          console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
        );
    };
    const fetchNotablePosts = (id) => {
      const urlPosts = `http://localhost:3000/notablePosts/${id}`;
      axios
        .get(urlPosts)
        .then((response) => {
          // array containing notable posts
          console.log("NOTBALE: ", response.data);
          setNotablePosts(response.data);
        })
        .catch((err) =>
          console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
        );
    };
    fetchUserData(userId);
    fetchNotablePosts(userId);
  }, [userId, updatecurrView]);

  const formatDateTime = (dateTime) => {
    const diffTime = Math.abs(new Date() - new Date(dateTime));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  if (!(user && notablePosts)) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box m={2}>
        <Typography variant="h2" color="primary" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>
        <Typography
          variant="overline"
          color="secondary"
          display="block"
          gutterBottom
        >
          Location
        </Typography>
        <Typography variant="h6" gutterBottom>
          {user.location}
        </Typography>
        <Typography
          variant="overline"
          color="secondary"
          display="block"
          gutterBottom
        >
          Occupation
        </Typography>
        <Typography variant="h6" gutterBottom>
          {user.occupation}
        </Typography>
        <Typography
          variant="overline"
          color="secondary"
          display="block"
          gutterBottom
        >
          Description
        </Typography>
        <Typography variant="body1" gutterBottom>
          {user.description}
        </Typography>
        <Typography>Photos</Typography>
        <Link
        to={`/photos/${user._id}`}
        style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            cursor: "pointer",
            textDecoration: 'none',
            "&:hover > :last-child": { display: "block" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CardMedia
              sx={{
                borderRadius: 4,
                height: "80px",
                width: "80px",
                border: "5px solid white",
              }}
              component="img"
              image={`./images/${notablePosts.newest.file_name}?w=90&h=90&fit=crop&auto=format`}
              alt={notablePosts.newest.file_name}
            />
            <Typography variant="caption">
              {formatDateTime(notablePosts.newest.date_time)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "-15px", // This line adds the overlap.
            }}
          >
            <CardMedia
              sx={{
                borderRadius: 4,
                height: "80px",
                width: "80px",
                border: "5px solid white",
              }}
              component="img"
              image={`./images/${notablePosts.mostComments.file_name}?w=90&h=90&fit=crop&auto=format`}
              alt={notablePosts.mostComments.file_name}
            />
            <Typography variant="caption">
              {`${notablePosts.mostComments.comments.length} comments`}
            </Typography>
          </Box>
          <IconButton sx={{ display: "none", color: "secondary" }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Link>
      </Box>
    </ThemeProvider>
  );
};

export default UserDetail;
