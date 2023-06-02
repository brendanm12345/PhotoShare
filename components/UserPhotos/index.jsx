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
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

function UserPhotos(props) {
  const [photos, setPhotos] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [visibleInput, setVisibleInput] = useState(null);
  const [refresh, setRefresh] = useState(true);

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
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateTime).toLocaleDateString(undefined, options);
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
          <ImageListItem key={photo._id}>
            <img
              src={`./images/${photo.file_name}?w=328&h=328&fit=crop&auto=format`}
              alt={photo.file_name}
              loading="lazy"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
            <div className="photo-info">
              <Typography variant="body2" className="date-time">
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
                          sx={{ bgcolor: "black" }}
                          style={{ textDecoration: "none" }}
                        >
                          {comment.user.first_name[0]}
                          {comment.user.last_name[0]}
                        </Avatar>
                        <Typography className="user-name">
                          {comment.user.first_name} {comment.user.last_name}
                        </Typography>
                      </Link>
                      <Typography className="date-time" variant="body2">
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
                  <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                    <Icon
                      baseClassName="fas"
                      className="fa-plus-circle"
                      fontSize="small"
                    />

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
                  </Box>
                  <Button
                    onClick={handleAddComment}
                    variant="text"
                    color="primary"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
}

export default UserPhotos;
