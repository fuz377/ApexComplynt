import Complaint from '../models/Complaint.js';

// CREATE complaint
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, isAnonymous } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      isAnonymous,
      submittedBy: isAnonymous ? 'Anonymous' : req.user.name,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

// GET all complaints (admin)
export const getComplaints = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { user: req.user._id };

    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (err) {
    next(err);
  }
};

// GET single complaint
export const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// UPDATE status (admin)
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    complaint.status = status;

    complaint.comments.push({
      author: 'System',
      text: `Status changed to ${status}`,
      isAdmin: true,
      isSystem: true
    });

    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// ADD comment
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    complaint.comments.push({
      author: req.user.role === 'admin' ? 'Admin' : 'User',
      text,
      isAdmin: req.user.role === 'admin'
    });

    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// DELETE (owner or admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if user is the owner or admin
    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};