const mongoose = require("mongoose")

console.log(process.env)

if (process.env.NODE_ENV !== "production") {
    const url = require("dotenv").config()
    console.log(process.env)
}

const url = process.env.MONGODB_URL

mongoose.connect(url)

const Person = mongoose.model("Person", {
    name: String,
    number: String,
    id: Number,
    date: Date,
})


module.exports = Person
