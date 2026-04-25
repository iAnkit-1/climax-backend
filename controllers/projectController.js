import Project from '../models/Project.js';

// @desc    Get all projects (with filtering)
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const { status, projectType, location, verifier } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (projectType) query.projectType = projectType;
    if (location) query['location.state'] = location;
    if (verifier) query.verifier = verifier;

    const projects = await Project.find(query).populate('seller', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seller's projects
// @route   GET /api/projects/myprojects
// @access  Private
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ seller: req.user._id })
      .populate('seller', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('selectedAuditor', 'name email');

    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { 
      title, projectType, energyUse, fuelType, emissionFactor, additionalityProof, 
      iotConnected, iotDeviceId, selectedAuditor, credits, pricePerCredit
    } = req.body;
    
    // Fallback if structured location string was sent
    const locationStr = req.body.location || "{}"; 
    
    const documents = req.files ? req.files.map(f => ({
      name: f.originalname,
      url: `/${f.path.replace(/\\/g, '/')}`,
      type: f.mimetype,
      size: f.size
    })) : [];

    const project = new Project({
      title,
      projectType,
      seller: req.user._id,
      location: typeof locationStr === 'string' ? JSON.parse(locationStr) : locationStr,
      energyUse,
      fuelType,
      emissionFactor,
      additionalityProof,
      documents,
      iotConnected: iotConnected === 'true',
      iotDeviceId,
      selectedAuditor: (selectedAuditor && /^[0-9a-fA-F]{24}$/.test(selectedAuditor)) ? selectedAuditor : undefined,
      credits: Number(credits) || 0,
      pricePerCredit: Number(pricePerCredit) || 0,
      status: 'pending',
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Public (would be Admin/Auditor protected)
export const updateProjectStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      project.status = status;
      if (feedback) {
        project.auditorFeedback = feedback;
      }
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
