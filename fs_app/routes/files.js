const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4:uuid4 } = require('uuid');
const File = require('../models/file');
let storage = multer.diskStorage({
    destination: (req,file,cb) => cb(null , 'uploads/'),
    filename: (req,file,cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null , uniqueName);
    }
});


let upload = multer({
storage: storage,
limit: {fileSize:1000000 * 100}
}).single('myfile');//--ye name attribute hta h jo fe se aarha h file name 












router.post('/',(req,res)=>{
    //store files
    upload(req,res,async(err)=>{
           //validate request
        if(!req.file) {
            return res.json({error:'File must be there'});
        }
        if(err) {
            return res.status(500).send({error:err.message})
        }
          //store on database
          const file = new File ({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
          })


          const response = await file.save();
          return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}`})
          //http://localhost:3000/files/hfhudunnj4udhjjbjcjkjckc -->downloadable lnk

    })
    //response -->> download link
})
router.post('/send',async(req,res)=>{
    //validate request
    const {uuid,emailTo,emailFrom} = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({error:"All fields are required. "});
    }
    //Get data from database
    const file = await File.findOne({uuid: uuid});
    if(file.sender) {
        return res.status(422).send({error:"Emal already sent."});
    }
    file.sender = emailFrom;
    file.reciever = emailTo;
    const response = await file.save();
    //send email
    const sendMail = require('../services/emailService');
    sendMail({
        from:emailFrom,
        to:emailTo,
        subject:'InShare file sharing',
        text: `${emailFrom} shareda file with you. `,
        html: require('../services/emailTemplate')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size/1000) + 'KB',
            expires: '24 hours'
                })
            })
    return res.send({success:'True'});
})

module.exports = router ;