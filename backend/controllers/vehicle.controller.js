const { Vehicle } = require('../models/index');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get all vehicles
exports.getAll = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const vehicles = await Vehicle.find(filter).populate('assignedTo', 'name phone');
    successResponse(res, vehicles);
  } catch { errorResponse(res, 'Failed to fetch vehicles'); }
};

// @desc    Get single vehicle
exports.getOne = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedTo', 'name');
    if (!vehicle) return errorResponse(res, 'Vehicle not found', 404);
    successResponse(res, vehicle);
  } catch { errorResponse(res, 'Failed to fetch vehicle'); }
};

// @desc    Create vehicle
exports.create = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    successResponse(res, vehicle, 'Vehicle created', 201);
  } catch (err) { errorResponse(res, err.message); }
};

// @desc    Update vehicle
exports.update = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return errorResponse(res, 'Vehicle not found', 404);
    successResponse(res, vehicle, 'Vehicle updated');
  } catch (err) { errorResponse(res, err.message); }
};

// @desc    Delete vehicle
exports.delete = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Vehicle deleted');
  } catch { errorResponse(res, 'Delete failed'); }
};

// @desc    Get available vehicles
exports.getAvailable = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' });
    successResponse(res, vehicles);
  } catch { errorResponse(res, 'Failed to fetch available vehicles'); }
};
