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
    if (location) query['location.state'] = location; // simplified location search
    if (verifier) query.verifier = verifier;

    const projects = await Project.find(query).populate('seller', 'name email');
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
// @access  Public
export const createProject = async (req, res) => {
  try {
    // Expecting seller as userId in body for testing purposes
    const projectData = req.body;
    
    const project = await Project.create(projectData);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid project data', error: error.message });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Public (would be Admin/Auditor protected)
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      project.status = status;
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
