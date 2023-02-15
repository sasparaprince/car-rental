const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/registration",{
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
}).then(()=>{
    console.log(`connection sucessful`);
}).catch((e)=>{
    console.log(`no connection`);
})
