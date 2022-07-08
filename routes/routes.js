const express = require("express");
const app = express();

const auth = require('./auth')
const product = require("./product");
const category = require("./category")
const store = require("./store.js")
const payment = require("./payment.js");
const order = require("./order");
const subscription = require("./subscription");
const conversation = require("./conversation");
const message = require("./message");
app.get('/call', (req, res)=>{
    res.render('../view/call.ejs')
})
app.use("/auth", auth);
app.use("/product",product)
app.use("/category", category)
app.use("/store", store)
app.use("/payment", payment)
app.use("/order", order)
app.use("/subscription",subscription)
app.use("/conversation",conversation)
app.use("/message",message)







module.exports = app;
