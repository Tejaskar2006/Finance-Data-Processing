const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const { logAction } = require('../services/audit.service');
const { emitToUser, emitToAdmins } = require('../services/websocket.service');

exports.createRequest = async (req, res, next) => {
  try {
    const { requestedRole, reason } = req.body;
    
    if (req.user.role === 'Admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot request role upgrades.' });
    }

    if (requestedRole === req.user.role) {
      return res.status(400).json({ success: false, message: `You are already a(n) ${requestedRole}.` });
    }
    
    // Check if user already has a pending request
    const existing = await AccessRequest.findOne({ user: req.user.id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending request.' });
    }

    const request = await AccessRequest.create({
      user: req.user.id,
      requestedRole,
      reason
    });

    res.status(201).json({ success: true, data: request });

    // Notify all connected admins of the new request in real-time
    emitToAdmins('access_request:new', { request: await request.populate('user', 'name email role') });

    // Log the action
    logAction({
      req,
      action: 'ACCESS_REQUEST_CREATED',
      entity: 'AccessRequest',
      entityId: request._id,
      details: `User requested role upgrade to ${request.requestedRole}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await AccessRequest.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    // 1. Atomic Update: Find pending request and mark as approved in one step
    // This prevents double-approval race conditions at the database level.
    const request = await AccessRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'approved' },
      { new: true }
    ).populate('user');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or already processed.' });
    }

    const { user, requestedRole } = request;

    // 2. Consistency Checks
    if (!user || user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'User is no longer active. Upgrade cancelled.' });
    }

    // 3. Prevent Downgrade: Skip update if user is already Admin and request was for Analyst
    const roleHierachy = { Admin: 3, Analyst: 2, Viewer: 1 };
    if (roleHierachy[user.role] >= roleHierachy[requestedRole]) {
      return res.status(200).json({ 
        success: true, 
        message: `User already has ${user.role} role. Request marked as processed without downgrade.`, 
        data: request 
      });
    }

    // 4. Perform Role Update
    await User.findByIdAndUpdate(user._id, { role: requestedRole });

    res.status(200).json({ success: true, message: 'Request approved successfully', data: request });

    // Notify the affected user of their new role in real-time
    emitToUser(String(user._id), 'role:updated', { newRole: requestedRole });

    // 5. Log the action
    logAction({
      req,
      action: 'ACCESS_REQUEST_APPROVED',
      entity: 'AccessRequest',
      entityId: request._id,
      details: `Admin approved request for ${user.email} to become ${requestedRole}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ success: true, message: 'Request rejected', data: request });

    // Notify the affected user of the rejection in real-time
    emitToUser(String(request.user), 'access_request:rejected', {
      message: 'Your role upgrade request has been rejected by an Admin.',
    });

    // Log the action
    logAction({
      req,
      action: 'ACCESS_REQUEST_REJECTED',
      entity: 'AccessRequest',
      entityId: request._id,
      details: `Admin rejected role upgrade request for ID: ${request._id}`,
    });
  } catch (error) {
    next(error);
  }
};
