const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name : {
                type : String
            },
            price: {
                type: Number
            },
            fuelType : String,
        
            description: {
                type : String
            },
            seats: {
                type: Number
            }
        })

const Userdb = mongoose.model('userdb', schema);

module.exports = Userdb;