const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {isReviewer, isUser, isAdmin} = require('../controllers/aws/aws_cognito');

/* GET users listing. */
router.get('/getBlockDate', userController.getBlockDate);
router.get('/getBookingData', userController.getBookingData);
router.get('/getWorkingHours', userController.getWorkingHours);

router.post('/', userController.createuser);    // create user or sign up : {email, password, userName}
router.post('/autosave', isUser(), userController.autosave);    // Auto Save API
   // get all application by userId
router.get('/getapplicationbyid', userController.getApplicationbyid);    // get all applicant by SEQ
router.post('/changestatus', isUser(), userController.changeStatus);    // Change Status DRAFTEED to SUBMITE
router.get('/getsubmitedapplication', isAdmin(), userController.getsubmitedapplication);    // GET all submitted application for admin
router.get('/getquestions', userController.getquestions);    // get all questions by FORM-NAME
router.post('/reviewapplication', isAdmin(), userController.reviewApplication);    // Review Submitted Application
router.get('/getallcategory', userController.getallcategory);    // Fetch Default Category for education
router.get('/getuserallform', isUser(), userController.getuserallform);    // User can get all form if he fill those in past expect this one
router.get('/getattachmentlist', isUser(), userController.getattachmentlist);    // get Attachment List
router.post('/uploadattachment', userController.uploadattachment);    // upload Attachment
router.get('/getuploadedattachment', userController.getuploadedattachment);    // get uploaded attachment
router.get('/getverifiedforms', isAdmin(), userController.getverifiedforms);    // get uploaded attachment
router.post('/scheduleform', isAdmin(), userController.scheduleform);    // get uploaded attachment
router.get('/getUserById', userController.findUserbyId);    // User can get all form if he fill those in past expect this one
router.get('/getallactivity', userController.getallactivity);    // get all activity
router.get('/getactivitybyidapplication', userController.getactivitybyidapplication);    // get all activity
router.get('/testemail', userController.testemail);    // get all activity



module.exports = router;
