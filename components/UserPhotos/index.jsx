import React, { useEffect, useState } from "react";
import {
  Avatar,
  Typography,
  ImageList,
  ImageListItem,
  TextField,
  Box,
  Button,
  Icon,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  CardActions,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

const mongoose = require("mongoose");

function UserPhotos(props) {
  const [photos, setPhotos] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [visibleInput, setVisibleInput] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let isComponentMounted = true;
    let userId = props.userId;

    if (refresh) {
      let userUrl = `http://localhost:3000/user/${userId}`;
      axios
        .get(userUrl)
        .then((response) => {
          let { first_name, last_name } = response.data;
          props.updatecurrView(`Photos of ${first_name} ${last_name}`);
        })
        .catch((err) =>
          console.error(`Status: ${err.status}, Status Text: ${err.statusText}`)
        );

      let photoUrl = `http://localhost:3000/photosOfUser/${userId}`;
      axios.get(photoUrl).then((response) => {
        setRefresh(false);
        if (isComponentMounted) {
          setPhotos(response.data);
        }
      });
    }

    return () => {
      isComponentMounted = false;
    };
  }, [refresh, props.userId, props.updatecurrView]);

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

  const handleAddComment = () => {
    console.log("NEW C: ", newComment);
    console.log("current photo: ", visibleInput);
    let url = `http://localhost:3000/commentsOfPhoto/${visibleInput}`;
    axios
      .post(url, { newComment })
      .then((response) => {
        console.log(response);
        setNewComment("");
        setRefresh(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleToggleLike = (photoId) => {
    console.log("LOGGED IN AS: ", props.userId);
    let url = `http://localhost:3000/likes/${photoId}`;
    axios.post(url).then(() => setRefresh(true));
  };

  const handleInputChange = (index) => {
    setVisibleInput(index);
  };

  if (!photos) {
    return <Typography variant="body1">Loading user photos...</Typography>;
  }

  return (
    <div>
      <ImageList sx={{ width: 600, height: 600 }} cols={2} rowHeight="auto">
        {photos.map((photo) => (
          <div>
            <Card key={photo._id} sx={{ maxWidth: 345, alignItems: "left" }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="180"
                  image={`./images/${photo.file_name}?w=328&h=328&fit=crop&auto=format`}
                  alt={photo.file_name}
                />
                <CardContent>
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    variant="caption"
                    component="div"
                  >
                    {formatDateTime(photo.date_time)}
                  </Typography>
                  <div className="comments">
                    {photo.comments?.map((comment) => (
                      <div key={comment._id} className="comment">
                        <div className="user-info">
                          <Link
                            to={`/users/${comment.user._id}`}
                            className="user-link"
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
                              {comment.user.first_name[0]}
                              {comment.user.last_name[0]}
                            </Avatar>
                            <Typography className="user-name">
                              {comment.user.first_name} {comment.user.last_name}
                            </Typography>
                          </Link>
                          <Typography
                            color="text.secondary"
                            className="date-time"
                            variant="body2"
                          >
                            {formatDateTime(comment.date_time)}
                          </Typography>
                        </div>
                        <Typography className="comment-text">
                          {comment.comment}
                        </Typography>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          backgroundColor: "green",
                        }}
                      >
                        <TextField
                          placeholder="Add Comment"
                          value={visibleInput == photo._id ? newComment : ""}
                          onChange={(event) => {
                            setNewComment(event.target.value);
                            setVisibleInput(photo._id);
                          }}
                          multiline
                          id="input-with-sx"
                          label="Add Comment"
                          variant="standard"
                        />
                        <Button
                          onClick={handleAddComment}
                          variant="text"
                          color="primary"
                        >
                          Post
                        </Button>
                      </Box>
                    </div>
                  </div>
                </CardContent>
              </CardActionArea>
              <CardActions>
                {console.log(
                  `User ID: ${props.loggedInAs._id}, Likes: ${photo.likes}`
                )}
                {photo.likes.includes(props.loggedInAs._id) ? (
                  <FavoriteIcon onClick={() => handleToggleLike(photo._id)} />
                ) : (
                  <FavoriteBorderIcon
                    onClick={() => handleToggleLike(photo._id)}
                  />
                )}
                <Typography>{photo.likes?.length}</Typography>
              </CardActions>
            </Card>
          </div>
        ))}
      </ImageList>
    </div>
  );
}

export default UserPhotos;
