//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  = require("lodash");

// const date = require(__dirname + "/date.js");
mongoose.set('strictQuery', false);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//to connect with mongodb cluster
mongoose.connect("mongodb+srv://admin-nick:nick009@cluster0.8v09mtv.mongodb.net/todolistDB");

// To connect with local mongodb database
// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your to do list"
});

const item2 = new Item({
  name: "welcome"
});

const item3 = new Item({
  name: "welcome to you."
});

const defaultItems = [item1, item2, item3];

const ListSchema = {
 name : String,
 items: [itemsSchema]
} ;

const List = mongoose.model("List", ListSchema);


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

if (foundItems.length===0) {
  Item.insertMany(defaultItems, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("successfully saved default items to database.");
    }
  });
   res.redirect("/");
} else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
}

  });
// const day = date.getDate();
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({name: customListName}, function(err, foundList){
  if (!err) {
    if (!foundList) {
      // Create a list
      const list = new List({
        name: customListName,
        items: defaultItems

    });
        list.save();
      res.redirect("/" + customListName);
    } else {
      // Show the existing list
      res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
    }
  }

});

});

app.post("/", function(req, res){

const itemName = req.body.newItem;
const listName = req.body.list ;

const item = new Item({
  name: itemName
});

if (listName=== "Today") {
  item.save();
  res.redirect("/");
} else {
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

// To delete an Item
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName ;

  if (listName=== "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("successfully removed checked item!");
        res.redirect("/");
      }
   });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId }}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }

});

// // app.get("/work", function(req, res){
// //   res.render("list", {listTitle: "Work List", newListItems: workItems});
// //  });

app.get("/about", function(req, res){
  res.render("about");
});

//Connecting to Heroku Server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully!");
});


//  Connecting to localhost

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
