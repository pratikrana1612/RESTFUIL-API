const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const path = require('path');
const mongoose = require('mongoose')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))
async function createAndConnect(schema = { title: String, content: String }, collection = 'article') {
    await mongoose.connect("mongodb://127.0.0.1:27017/wikiDB")
    const wikiSchema = new mongoose.Schema(schema)
    const Item = mongoose.models[collection] || new mongoose.model(collection, wikiSchema)
    return Item
}
async function readDatabase(doc = {}) {
    try {
        const Item = await createAndConnect();
        const result = await Item.find(doc);
        if (result.length === 0) {
            return "Nothing Found"
        }
        return result;
    } catch (error) {
        console.log(error)
    }
}
async function insertDatabase(title, content) {
    try {
        const Item = await createAndConnect();
        const doc = { title, content }
        const result = await Item.insertMany([doc])
        return result
    } catch (error) {
        console.log(error)
    }
}
async function updateDatabase(searchDoc, updatedDoc) {
    const Item = await createAndConnect()
    const result = await Item.updateOne(searchDoc, { $set: updatedDoc })
    return result
}
async function deleteDatabase(condition = {}) {
    try {
        const Item = await createAndConnect();
        const result = await Item.deleteMany(condition)
        return result
    }
    catch (err) {
        console.log(err)
    }
}

app.route('/articles')
    .get((req, res) => {
        readDatabase().then(result => {
            res.send(result)
        })
    })
    .post((req, res) => {
        insertDatabase(req.body.title, req.body.content).then(result => res.send(result))
    })
    .delete((req, res) => {
        deleteDatabase().then(result => res.send(result))
    })

app.route('/articles/:articlesTitle')
    .get((req, res) => {
        readDatabase({ title: req.params.articlesTitle }).then(result => res.send(result))
    })
    .put((req, res) => {
        updateDatabase({ title: req.params.articlesTitle }, { title: req.body.title, content: req.body.content }).then(result => res.send(result))
    })
    .patch((req, res) => {
        updateDatabase({ title: req.params.articlesTitle }, req.body).then(result => res.send(result))
    })
    .delete((req, res) => {
        deleteDatabase({ title: req.params.articlesTitle }).then(result => res.send(result))
    }) 
app.listen(3000, () => console.log('listing'))