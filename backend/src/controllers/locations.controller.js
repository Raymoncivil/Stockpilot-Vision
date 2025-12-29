const locationsService = require('../services/locations.service');

exports.getLocations = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      is_active: req.query.is_active
    };
    
    const locations = await locationsService.getLocations(filters);
    res.json(locations);
  } catch (error) {
    console.error('❌ Error getLocations:', error.message);
    res.status(500).json({
      message: 'Error al obtener ubicaciones'
    });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationsService.getLocationById(id);
    
    if (!location) {
      return res.status(404).json({
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json(location);
  } catch (error) {
    console.error('❌ Error getLocationById:', error.message);
    res.status(500).json({
      message: 'Error al obtener ubicación'
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await locationsService.createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    console.error('❌ Error createLocation:', error.message);
    
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'El código de ubicación ya existe'
      });
    }
    
    res.status(400).json({
      message: error.message
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationsService.updateLocation(id, req.body);
    
    if (!location) {
      return res.status(404).json({
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json(location);
  } catch (error) {
    console.error('❌ Error updateLocation:', error.message);
    res.status(400).json({
      message: error.message
    });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await locationsService.deleteLocation(id);
    
    if (!result) {
      return res.status(404).json({
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json({
      message: 'Ubicación desactivada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error deleteLocation:', error.message);
    res.status(500).json({
      message: 'Error al eliminar ubicación'
    });
  }
};

exports.getLocationStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await locationsService.getLocationStock(id);
    
    res.json(stock);
  } catch (error) {
    console.error('❌ Error getLocationStock:', error.message);
    res.status(500).json({
      message: 'Error al obtener stock de la ubicación'
    });
  }
};