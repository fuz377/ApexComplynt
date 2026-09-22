import Complaint from '../models/Complaint.js';
import PDFDocument from 'pdfkit';

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

// GET analytics (admin only)
export const getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total complaints count
    const totalComplaints = await Complaint.countDocuments();

    // Complaints by status
    const statusBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Complaints by priority
    const priorityBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Complaints by category
    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Anonymous vs Identified
    const anonymousCount = await Complaint.countDocuments({ isAnonymous: true });
    const identifiedCount = totalComplaints - anonymousCount;

    // 30-day trend
    const trendData = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Average resolution time
    const resolutionData = await Complaint.aggregate([
      {
        $match: {
          status: 'RESOLVED'
        }
      },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ['$updatedAt', '$createdAt']
            }
          }
        }
      }
    ]);

    const avgResolutionTime = resolutionData[0]?.avgTime ? Math.round(resolutionData[0].avgTime / (1000 * 60 * 60 * 24)) : 0;

    // Top 10 complainers
    const topComplainers = await Complaint.aggregate([
      {
        $group: {
          _id: '$user',
          complaintCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      },
      {
        $sort: { complaintCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userData.name',
          email: '$userData.email',
          complaintCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        statusBreakdown,
        priorityBreakdown,
        categoryBreakdown,
        anonymousCount,
        identifiedCount,
        trendData,
        avgResolutionTime,
        topComplainers
      }
    });
  } catch (error) {
    next(error);
  }
};

// DOWNLOAD analytics as PDF (admin only)
export const downloadAnalyticsPDF = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all analytics data
    const totalComplaints = await Complaint.countDocuments();

    const statusBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const anonymousCount = await Complaint.countDocuments({ isAnonymous: true });
    const identifiedCount = totalComplaints - anonymousCount;

    const trendData = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const resolutionData = await Complaint.aggregate([
      {
        $match: {
          status: 'RESOLVED'
        }
      },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ['$updatedAt', '$createdAt']
            }
          }
        }
      }
    ]);

    const avgResolutionTime = resolutionData[0]?.avgTime ? Math.round(resolutionData[0].avgTime / (1000 * 60 * 60 * 24)) : 0;

    const topComplainers = await Complaint.aggregate([
      {
        $group: {
          _id: '$user',
          complaintCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      },
      {
        $sort: { complaintCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userData.name',
          email: '$userData.email',
          complaintCount: 1
        }
      }
    ]);

    // Create PDF
    const doc = new PDFDocument();
    const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('Analytics Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);

    // Key Metrics
    doc.fontSize(14).font('Helvetica-Bold').text('Key Metrics', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Complaints: ${totalComplaints}`, { indent: 20 });
    doc.text(`Anonymous Complaints: ${anonymousCount}`, { indent: 20 });
    doc.text(`Identified Complaints: ${identifiedCount}`, { indent: 20 });
    doc.text(`Average Resolution Time: ${avgResolutionTime} days`, { indent: 20 });
    doc.moveDown(1);

    // Status Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Status Breakdown', { underline: true });
    doc.fontSize(10).font('Helvetica');
    statusBreakdown.forEach((item) => {
      const percentage = ((item.count / totalComplaints) * 100).toFixed(1);
      doc.text(`${item._id || 'Unknown'}: ${item.count} (${percentage}%)`, { indent: 20 });
    });
    doc.moveDown(1);

    // Priority Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Priority Breakdown', { underline: true });
    doc.fontSize(10).font('Helvetica');
    priorityBreakdown.forEach((item) => {
      const percentage = ((item.count / totalComplaints) * 100).toFixed(1);
      doc.text(`${item._id || 'Unknown'}: ${item.count} (${percentage}%)`, { indent: 20 });
    });
    doc.moveDown(1);

    // Category Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Category Breakdown', { underline: true });
    doc.fontSize(10).font('Helvetica');
    categoryBreakdown.slice(0, 10).forEach((item) => {
      const percentage = ((item.count / totalComplaints) * 100).toFixed(1);
      doc.text(`${item._id || 'Unknown'}: ${item.count} (${percentage}%)`, { indent: 20 });
    });
    if (categoryBreakdown.length > 10) {
      doc.text(`... and ${categoryBreakdown.length - 10} more categories`, { indent: 20 });
    }
    doc.moveDown(1);

    // Top Complainers
    doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Complainers', { underline: true });
    doc.fontSize(10).font('Helvetica');
    topComplainers.forEach((complainer, index) => {
      doc.text(`${index + 1}. ${complainer.name} (${complainer.email}) - ${complainer.complaintCount} complaints`, { indent: 20 });
    });
    doc.moveDown(1);

    // 30-Day Trend Summary
    doc.fontSize(14).font('Helvetica-Bold').text('30-Day Trend Summary', { underline: true });
    doc.fontSize(10).font('Helvetica');
    const totalTrendComplaints = trendData.reduce((sum, item) => sum + item.count, 0);
    doc.text(`Total complaints (last 30 days): ${totalTrendComplaints}`, { indent: 20 });
    doc.text(`Average per day: ${(totalTrendComplaints / Math.max(trendData.length, 1)).toFixed(1)}`, { indent: 20 });

    doc.end();
  } catch (error) {
    next(error);
  }
};