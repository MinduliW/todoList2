const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash")
app.set('view engine', 'ejs');

//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-minduli:test123@cluster0.qzbpx.mongodb.net/todolistDB", {useNewUrlParser: true})

const itemsSchema ={
name: String}

const Item =mongoose.model("item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your to do list! "
});

const item2 = new Item({
  name : "Click + to add a new item"
});

const item3 = new Item({
  name : "<-- click the checkbox to delete item"
});

const defaultItems =[item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));


app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if (err){console.log(err)}
        else {console.log("success")}
      });
res.redirect("/")
    }
    else{
      res.render("list", {
        listTitle: "Today",
        newListItems : foundItems
      });
    }

  });



});

app.get("/:customListName", function(req,res){

const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err,foundList){
  if(!err){
    if (!foundList){
      // create new list
      const list = new List({
        name : customListName,
        items : defaultItems
      });

      list.save();
      res.redirect("/" + customListName)
    }
    else{
      // show existing list
      res.render("list", {listTitle: foundList.name ,newListItems : foundList.items});

    }
  }
});


});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port, function() {
  console.log("server running.")
});

app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName
  })

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    });
  }




})


app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
  if(!err){console.log("successfully deleted");
  res.redirect("/");
}})}
else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });

}

});





app.get("/about", function(req, res){
  res.render("about");
});

app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})
