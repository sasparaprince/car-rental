const express = require('express');
const route = express.Router()

const services = require('../services/render');
const controller = require('../controller/controller');

route.get('/', services.homeRoutes);

route.get('/add-user', services.add_user)

route.get('/update-user', services.update_user)


// API
route.post('/api/users', controller.create);
route.get('/api/users', controller.find);
route.post('/api/users/:id', controller.update);
route.delete('/api/users/:id', controller.delete);
route.get('/car/:postId',controller.findCarById);
// route.get('/showcaradmin',controller.showcar)



module.exports = route