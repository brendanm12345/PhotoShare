/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
"use strict";

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);
const fs = require("fs");
const { ObjectId } = require("mongodb");

const express = require("express");
const app = express();
// ADDED
app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

// ADDED
const isLoggedIn = (request) => {
  //return true;
  return request.session.user !== undefined;
};

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if (!isLoggedIn(request))
    return response.status(401).send("User not logged in");

  User.find({}, "_id first_name last_name", function (err, users) {
    if (err) {
      console.error(err);
      response.status(500).send(JSON.stringify(err));
      // Handle the error accordingly
    } else {
      // `users` will contain an array of user objects with only the specified fields
      // console.log(users);
      response.status(200).send(users);
      // Process the retrieved users as needed
    }
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  if (!isLoggedIn(request))
    return response.status(401).send("User not logged in");

  const id = request.params.id;
  User.findOne({ _id: id }, function (err, user) {
    if (err) {
      console.log(err);
      response.status(400).send("maybe not found?");
      // response.status(400).send("Not found");
    } else {
      let currUser = JSON.stringify(user);
      currUser = JSON.parse(currUser);
      delete currUser.__v;
      delete currUser.login_name;
      delete currUser.password;
      console.log(currUser);
      response.json(currUser);
    }
  });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */

app.get("/photosOfUser/:id", function (request, response) {
  if (!isLoggedIn(request))
    return response.status(401).send("User not logged in");

  const id = request.params.id;
  // Check if the provided id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send("Invalid user id");
    return;
  }

  Photo.find({ user_id: id }, (err, photos) => {
    if (err) {
      response.status(400).send("Photo not found");
      return;
    }
    let requested_photos = [];
    async.each(
      photos,
      function (photo, callback) {
        if (err) {
          callback("Not found");
        }
        let requested_comments = [];
        let photo_obj = JSON.stringify(photo);
        photo_obj = JSON.parse(photo_obj);
        delete photo_obj.__v;
        async.each(
          photo_obj.comments,
          (comment, commentCallback) => {
            User.findOne(
              { _id: comment.user_id },
              // projection
              { first_name: 1, last_name: 1, _id: 1 },
              (err1) => {
                if (err1) {
                  response.status(400).send("Comment Not Found");
                }
              }
            )
              .clone()
              .then((user) => {
                let curr_comment = JSON.stringify(comment);
                curr_comment = JSON.parse(curr_comment);
                curr_comment.user = user;
                delete curr_comment.__v;
                delete curr_comment.user_id;
                requested_comments.push(curr_comment);
                commentCallback();
              });
          },
          function (err2) {
            if (err2) {
              response.status(400).send("Comment Not Found");
            } else {
              // sort timestamp
              requested_comments.sort(
                (start, end) =>
                  new Date(start.date_time) - new Date(end.date_time)
              );
              photo_obj.comments = requested_comments;
              requested_photos.push(photo_obj);
              callback();
            }
          }
        );
      },
      function (err3) {
        if (err3) {
          response.status(400).send("Could Not Find");
        } else {
          // sorted by the number of likes in descending order, break tie with timestamp
          requested_photos.sort((a, b) => {
            if (b.likes.length === a.likes.length) {
              return new Date(b.date_time) - new Date(a.date_time);
            }
            return b.likes.length - a.likes.length;
          });

          response.status(200).send(requested_photos);
        }
      }
    );
  });
});

app.get("/favorites", function (request, response) {
  if (!isLoggedIn(request)) {
    return response.status(400).send("User not logged in");
  }

  const id = request.session.user._id;

  Photo.find({ likes: { $in: [id] } }, (err, favorites) => {
    if (err) {
      return response.status(400).send("Error retrieving favorites");
    }

    if (!favorites) {
      return response.status(404).send("No favorites found");
    }

    response.status(200).send(favorites);
  });
});

// NEW
app.post("/admin/login", function (request, response) {
  const login_name = request.body.login_name;
  console.log("LEN", login_name.length);
  const password = request.body.password;
  console.log("Trying to post backend: ", login_name);
  User.findOne({ login_name }, (err, user) => {
    if (err || !user) {
      console.log("login_name");
      console.log(err);
      return response.status(400).send("User not found");
    } else if (user.password !== password) {
      console.log(user.password);
      return response.status(400).send("Wrong Password");
    } else {
      console.log(user);
      request.session.user = user;
      response.json(user);
    }
  }).clone();
});

app.post("/admin/logout", function (request, response) {
  if (!isLoggedIn(request)) {
    return response.status(400).send("User not logged in");
  }
  //delete console.log("before ", request.session);
  request.session.user = undefined;
  console.log("after ", request.session);
  response.json();
  // check if user is logged in — if not, return 400.send("User is not logged in");
  // remove reference with delete then call request.session.destroy(callback)
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});

// post newly added comments to photo
app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (!isLoggedIn(request)) {
    return response.status(400).send("User not logged in");
  }
  const _id = request.params.photo_id;
  const newComment = request.body.newComment;
  console.log("This is the new comment", newComment);
  if (!newComment.length) {
    response.status(400).send("Empty Comment");
  }

  Photo.findOne({ _id }, (err, photo) => {
    if (err) {
      response.status(400).send("No photo found with id: ", _id);
    } else {
      // add new comment from request
      photo.comments = [
        ...photo.comments,
        {
          comment: newComment,
          date_time: new Date(),
          user_id: request.session.user._id,
        },
      ];
    }
    console.log(photo);
    photo.save();
    response.status(200).send();
  }).clone();
});

app.get("/notablePosts/:id", (request, response) => {
  if (!isLoggedIn(request)) {
    return response.status(400).send("User not logged in");
  }
  const id = request.params.id;
  return Photo.find({ user_id: id })
    .then((photos) => {
      if (!photos) {
        return response.status(400).send("Photo not found");
      } else {
        const newest = [...photos].sort(
          (a, b) => new Date(b.date_time) - new Date(a.date_time)
        )[0];
        const mostComments = [...photos].sort(
          (a, b) => b.comments.length - a.comments.length
        )[0];
        return response.status(200).json({ newest, mostComments });
      }
    })
    .catch((err) => {
      console.error(err);
      response.status(500).send("Server Error");
    });
});

app.post("/photos/new", function (request, response) {
  if (!isLoggedIn(request)) {
    return response.status(401).send("Please log in before uploading");
  }

  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      response.status(400).send("Upload Error");
      return;
    }
    // request.file has the following properties of interest:
    //   fieldname    - Should be 'uploadedphoto' since that is what we sent
    //   originalname - The name of the file the user uploaded
    //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
    //                  'image/png')
    //   buffer       - A node Buffer containing the contents of the file
    //   size         - The size of the file in bytes
    if (request.file.fieldname !== "uploadedphoto") {
      response.status(400).send("Invalid Field Name");
    }

    if (!request.file.mimetype.includes("image")) {
      response.status(400).send("Invalid File Type");
    }

    // We need to create the file in the directory "images" under an unique name.
    // We make the original file name unique by adding a unique prefix with a
    // timestamp.
    const date_time = new Date().valueOf();
    const file_name = "U" + String(date_time) + request.file.originalname;

    fs.writeFile("./images/" + file_name, request.file.buffer, function (err) {
      if (err) {
        return response
          .status(400)
          .send("Could not write photo to image directory");
      }
      const photo = {
        file_name,
        date_time,
        user_id: request.session.user?._id,
        comments: [],
      };
      Photo.create(photo, (createErr, newPhoto) => {
        if (createErr) response.status(400).send("Creation Error");
        newPhoto.save();
        response.status(200).send();
      });
    });
  });

  app.post("/user", function (request, response) {
    if (!isLoggedIn(reuqest)) {
      return response.status(400).send("User not logged in");
    }
    if (!login_name || !password || !first_name || !last_name) {
      response.status(400).send("Missing attribute");
    }

    User.findOne({ login_name }, (err, existingUser) => {
      if (err) {
        return response.status(400).send("Error");
      }

      const user = request.body;
      const { login_name, password, first_name, last_name } = user;

      if (oldUser) {
        return response
          .status(400)
          .send("User with login_name: " + login_name + " already exists");
      } else {
        User.create(user, (user_err, newUser) => {
          if (user_err) {
            return response.status(400).send("User Creation Error.");
          }
          newUser.save();
          if (newUser?.__v) {
            delete newUser.__v;
          }
          request.session.user = newUser;
          response.json(newUser);
        });
      }
    }).clone();
  });
});

// call this on liked button clicked
app.post("/likes/:photo_id", function (request, response) {
  if (!isLoggedIn(request)) {
    return response.status(401).send("User not logged in");
  }
  var _id = request.params.photo_id;

  var userId = request.session.user._id;

  return Photo.findOne({ _id }, (err, photo) => {
    if (err) {
      return response.status(400).send("Could not find photo ", photoId);
    } else {
      console.log("photooo: ", photo);
      console.log("photolikes: ", photo.likes);
      // if its already been liked by the user, remove it
      if (photo.likes.includes(request.session.user._id)) {
        // filter it out the one the matches session.user.id (keep the rest)
        photo.likes = photo.likes.filter(
          (like) => like.toString() !== request.session.user._id.toString()
        );
      } else {
        // otherwise add it to array of likes
        photo.likes = [...photo.likes, new ObjectId(userId)];
      }

      photo.save();
      return response.status(200).send();
    }
  }).clone();
});
