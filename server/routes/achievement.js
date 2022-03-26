// Importing npm modules
const express = require("express");
const router = express.Router();
const Achievement = require("../models/achievement");

const {
  isSignedIn,
  isAdmin
} = require("../middleware/auth");

//Implementing the CRUD operations below

// Fetching all achievement
router.get("/achievement", (req, res) => {
  res.setHeader("Content-Range", "achievement 0-10/20");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");

  Achievement.find({})
    .sort("-date")
    .then((achievements) => {
      let arr = [];
      achievements.forEach((achievement) => arr.push(achievement.transform()));
      res.json(arr);
    })
    .catch((e) => console.log(e));
});

// Group achievements by their year
router.get("/achievement/year", (req, res) => {
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");

  Achievement.aggregate(
    [{
        $group: {
          _id: "$year",
          achievements: {
            $push: "$$ROOT"
          },
          year: {
            $first: "$year"
          }
        },
      },
      {
        $sort: {
          "year": -1
        }
      },
    ],
    (e, achievements) => {
      if (e) {
        console.log(e);
        res.status(400).json({
          msg: "Internal Server Error.",
        });
      }
      res.json(achievements);
    }
  );
});

// Fetching an achievement with id using params
router.get("/achievement/:id", (req, res) => {
  Achievement.findOne({
      _id: req.params.id
    })
    .then((achievement) => {
      res.json(achievement.transform());
    })
    .catch((e) => console.log(e));
});

// Creating a new achievement
router.post("/achievement", isSignedIn, isAdmin, (req, res) => {
  const achievement = new Achievement(req.body);
  achievement
    .save()
    .then((achievement) => {
      res.json(achievement.transform());
    })
    .catch((e) => res.status(400).json({
      error: "Cannot be created !",
    }));
});

// Updating an achievement
router.put("/achievement/:id", isSignedIn, isAdmin, (req, res) => {
  Achievement.findOneAndReplace({
      _id: req.params.id
    },
    req.body,
    null,
    (e, achievement) => {
      if (e) {
        return res.status(400).json({
          error: "Achievement cannot be updated !",
        });
      }
      return res.json(achievement.transform());
    }
  );
});

// Deleting an achievement
router.delete("/achievement/:id", isSignedIn, isAdmin, (req, res) => {
  Achievement.findByIdAndDelete(req.params.id, (err, achievement) => {
    if (err) return res.status(500).send(err);
    return res.json({
      achievement
    });
  });
});

module.exports = router;
