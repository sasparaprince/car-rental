const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    carName: {
        type: String
    },
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
    total: {
        type: String
    }

})

const orderDb = mongoose.model('orderDb', schema);
module.exports = orderDb;