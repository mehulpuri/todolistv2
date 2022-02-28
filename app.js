//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-meh:xfyuqfHXQps97z6@cluster0.rfp7p.mongodb.net/todolistDB");

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"<-- Hit this to strike out an item"
});

const defaultItems= [item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
      });
      res.redirect("/");
    }

    res.render("list", {listTitle: "Welcome to your To-Do-List", newListItems: foundItems});
  });
});

//adding items

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item= new Item({
    name: itemName
  });

  if(listName === "Welcome to your To-Do-List"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Welcome to your To-Do-List"){
      Item.findByIdAndRemove(checkedItemId,function(err){
        if(err){
          console.log(err);
        }else{
          res.redirect("/");
        }
      });
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err, foundList){
        if(!err){
          res.redirect("/" +listName);
        }
      })
    }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        // show existing list
        res.render("list", {
          listTitle:foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/:customListName", function(req,res){
  const customListName = _.capitalize(req.body.newListname);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        // show existing list
        res.render("list", {
          listTitle:foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

const PORT = process.env.PORT || '3000';
app.listen(PORT, function(){
  console.log("the server is up and running");
});
