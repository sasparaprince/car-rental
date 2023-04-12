const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    Pickup: {
        type: String
    },
    Dropoff: {
        type: String
    },

    PickupDate: {
        type: String
    },
    DropoffDate: {
        type: String
    },

})

const orderDb = mongoose.model('orderDb', schema);
module.exports = orderDb;