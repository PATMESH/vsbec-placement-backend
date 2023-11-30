const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const router = express.Router();
   
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


router.get('/', async (req, res) => {
    return res.json("Hello")
  }); 

app.use(".netlify/functions/api" , router)
