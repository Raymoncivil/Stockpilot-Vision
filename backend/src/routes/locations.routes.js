const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const { 
  validateLocationCreation, 
  validateId 
} = require('../middlewares/validation.middleware');

// GET /locations - Obtener todas las ubicaciones (con filtros opcionales)
router.get('/', locationsController.getLocations);

// GET /locations/:id - Obtener una ubicación por ID
router.get('/:id', validateId, locationsController.getLocationById);

// POST /locations - Crear una nueva ubicación
router.post('/', validateLocationCreation, locationsController.createLocation);

// PUT /locations/:id - Actualizar una ubicación
router.put('/:id', validateId, locationsController.updateLocation);

// DELETE /locations/:id - Eliminar (desactivar) una ubicación
router.delete('/:id', validateId, locationsController.deleteLocation);

// GET /locations/:id/stock - Obtener stock en una ubicación específica
router.get('/:id/stock', validateId, locationsController.getLocationStock);

module.exports = router;