const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
   
app.use(cors());
app.use(express.json());

const atlasConnectionURI = 'mongodb+srv://patmesh2003:<qbpte4hFjjxyAsXi>@cluster0.9pptbuf.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(atlasConnectionURI, {
    authSource: 'admin', 
    user: 'patmesh2003', 
    pass: 'qbpte4hFjjxyAsXi',  
  }).then(console.log("connected to mongodb"));
  
 
  const userAuthSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
  });
  
  const adminAuthSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
  });
  
  const userDetailsSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    phoneNumber: String,
    tenthMark: Number,
    twelfthMark: Number,
    currentCgpa: Number,
    fatherName: String,
    registerNumber: String,
    projectNames: [String],
    skills: [String],
    dateOfBirth: String,
    gender: String,
    department: String,
    degree: String,
    resumeDriveLink: String,
  });
  
  const UserAuth = mongoose.model('UserAuth', userAuthSchema);
  const AdminAuth = mongoose.model('AdminAuth', adminAuthSchema);
  const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
  
  app.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const userExists = await UserAuth.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserAuth({ name, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserAuth.findOne({ email });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {  
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY');
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post("/addDetails", async (req, res) => {
    try {
      const {
        name,
        email,
        registerNumber,
        fatherName,
        address,
        phoneNumber,
        dob,
        gender,
        tenthMark,
        twelfthMark,
        degree,
        department,
        currentCgpa,
        project1,
        project2,
        project3,
        project4,
        skills,
        portfolioLink,
        githubLink,
        linkedinProfile, 
        resumeLink,
      } = req.body; 

      console.log(phoneNumber);
   
      const userDetails = new UserDetails({
        name,
        email,
        registerNumber,
        fatherName,
        address,
        dateOfBirth:dob,
        gender,
        tenthMark,
        twelfthMark,
        degree,
        department,
        currentCgpa,
        projectNames: [project1, project2, project3, project4],
        skills,
        resumeDriveLink: resumeLink,
      });
  
      await userDetails.save();
      res.status(201).json({ message: 'Details added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


app.get('/users', async (req, res) => {
    try {
      const userdetails = await UserDetails.find();
      res.json(userdetails);
    } catch (error) { 
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }); 


  // <------------- for attendance app ----------------> 

  const studentAttendanceSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    attendance: [
      {
        date: {
          type: String,
          required: true,
        },
        isPresent: {
          type: Boolean,
          default: false,
        },
      },
    ],
  });

  const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);

  app.post('/student/register', async (req, res) => {
  try {
    const { name, registerNumber, email, department, year, section } = req.body;

    const StudentAttendance = mongoose.model('StudentAttendance');

    let studentAttendance = await StudentAttendance.findOne({
      registerNumber: registerNumber,
    });

    if (!studentAttendance) {
      studentAttendance = new StudentAttendance({
        name,
        registerNumber,
        email,
        department,
        year,
        section,
        attendance: [],
      });

      await studentAttendance.save();

      res.status(200).json({ message: 'Student registered successfully.' });
      } else {
        res.status(200).json({ error: 'Student already exists.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/student/all', async (req, res) => {
    try {
      const StudentAttendance = mongoose.model('StudentAttendance');
      const allStudents = await StudentAttendance.find();
      res.status(200).json(allStudents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/student/markAttendance', async (req, res) => {
    try {
      const { date, registerNumber } = req.body;
      const student = await StudentAttendance.findOne({ registerNumber });
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      const existingAttendance = student.attendance.find((entry) => entry.date === date);
      if (existingAttendance) {
        return res.status(200).json({ error: 'Attendance already marked for this date' });
      }
  
      student.attendance.push({
        date: date,
        isPresent: true,
      });
  
      await student.save();
  
      return res.status(200).json({ message: 'Attendance marked successfully' });
    } catch (error) {
      console.error('Error marking attendance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/healthtip', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'healthtip.json');
    const healthTips = JSON.parse(fs.readFileSync(jsonFilePath).toString()).healthTips;

    const getRandomHealthTip = () => {
        const randomIndex = Math.floor(Math.random() * healthTips.length);
        return healthTips[randomIndex];
    };

    const randomTip = getRandomHealthTip();

    res.json({ healthTip: randomTip });
});
  
  


  app.listen(8080, () => {
    console.log(`Server is running at 8080`);
  });