"use strict";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Modal,
  Box,
  Card,
  CardMedia,
  IconButton,
  CardContent,
  Avatar,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import axios from "axios";

export default function Favorites(props) {
  const [favorites, setFavorites] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const handleOpen = (photo) => {
    setCurrentPhoto(photo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPhoto(null);
  };

  // get favorities (from photo schema) and mix in user data (user schema)
  useEffect(() => {
    let isComponentMounted = true;

    let url = "http://localhost:3000/favorites";
    axios
      .get(url)
      .then((response) => {
        if (isComponentMounted) {
          // Create an array of promises that fetch each user's data
          const userPromises = response.data.map((photo) =>
            axios.get(`http://localhost:3000/user/${photo.user_id}`)
          );
          // Wait for all promises to resolve
          Promise.all(userPromises)
            .then((userResponses) => {
              // Assign each photo's user data to the corresponding photo
              const photosWithUserData = response.data.map((photo, index) => ({
                ...photo,
                user: userResponses[index].data,
              }));

              setFavorites(photosWithUserData);
            })
            .catch((err) => console.error("Error fetching user data: ", err));
        }
      })
      .catch((err) =>
        console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
      );

    return () => {
      isComponentMounted = false;
    };
  }, [favorites]);

  const handleToggleLike = (photoId) => {
    console.log("LOGGED IN AS: ", props.userId);
    let url = `http://localhost:3000/likes/${photoId}`;
    axios.post(url).then(() => setRefresh(true));
  };

  // const formatDateTime = (dateTime) => {
  //   const options = {
  //     day: "numeric",
  //     month: "long",
  //     year: "numeric",
  //   };
  //   return new Date(dateTime).toLocaleDateString(undefined, options);
  // };
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

  if (!favorites) {
    return <Typography variant="body1">Loading your favorites...</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Typography variant="h5">My Favorites</Typography>
      <Grid container spacing={3}>
        {console.log("FAVS: ", favorites)}
        {favorites.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`./images/${photo.file_name}?w=328&h=328&fit=crop&auto=format`}
                alt={photo.file_name}
                onClick={() => handleOpen(photo)}
              />
              <CardContent>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Link
                      to={`/users/${photo.user_id}`}
                      //className="user-link"
                    >
                      <Avatar
                        sx={{
                          bgcolor: "black",
                          width: 28,
                          height: 28,
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                        style={{ textDecoration: "none" }}
                      >
                        {photo.user.first_name[0]}
                        {photo.user.last_name[0]}
                      </Avatar>
                      <Typography className="user-name">
                        {photo.user.first_name} {photo.user.last_name}
                      </Typography>
                    </Link>
                    <Typography variant="body2" color="secondary">
                      {formatDateTime(photo.date_time)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={() => handleToggleLike(photo._id)}>
                      <FavoriteIcon />
                      <Typography>{photo.likes?.length}</Typography>
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "60%",
            height: "60%",
            margin: "auto",
            marginTop: "10vh",
            overflow: "auto",
          }}
        >
          {currentPhoto && (
            <>
              <img
                src={`./images/${currentPhoto.file_name}?w=600&h=600&fit=crop&auto=format`}
                alt={currentPhoto.file_name}
                style={{ width: "100%", objectFit: "contain" }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  mt: 2,
                }}
              >
                <Box>
                  <Typography variant="body1">
                    {currentPhoto.user_name}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {formatDateTime(currentPhoto.date_time)}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => handleToggleLike(currentPhoto._id)}
                  >
                    <FavoriteIcon />
                    <Typography>{currentPhoto.likes?.length}</Typography>
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </ThemeProvider>
  );
}
