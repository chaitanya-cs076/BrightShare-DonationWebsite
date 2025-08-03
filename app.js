var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

const app = express();

const multer = require('multer');
const Grid = require('gridfs-stream');
const path = require('path');


/*const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Directory to store uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: function (req, file, cb) {  
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept images only
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    }
});*/


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Set the public directory as the static directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to handle GET requests to "/login"
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

mongoose.connect('mongodb://localhost:27017/db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
/*const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

*/

var db = mongoose.connection;

db.on('error', () => console.log("error in connecting to database"));
db.once('open', () => console.log("connected to database"));



app.post("/register", (req, res) => {
    var fname = req.body.firstName;
    var lname = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var pno=req.body.phone;
    var aadhaarno=req.body.aadhaar;
    var optionalMessage=req.body.optionalMessage;

    var data = {
        'fname': fname,
        'lname': lname,
        'email': email,
        'password': password,
        'phone no':pno,
        'aadhaar no':aadhaarno,
        'optional Message':optionalMessage
    }

    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Record Inserted Successfully");
        
        // Send email to the user with the donation details
        const mailOptions = {
            from: 'brightshare.donate@gmail.com', // Replace with your email address
            to: email,
            subject: 'Thank you for your registration!',
            html: `
                <p>Hello ${fname},</p>
                <p>Thank you for your generous registration!</p>
                <p>We appreciate your support.</p>
                <p>Best regards,</p>
                <p>BrightShare</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });

    

    return res.redirect('donation.html');

});

app.post("/contact", (req, res) => {
    var fname = req.body.firstName;
    var lname = req.body.lastName;
    var email = req.body.email;
    

    var data = {
        'fname': fname,
        'lname': lname,
        'email': email,
        
    }

    db.collection('contact').insertOne(data, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Record Inserted Successfully");
        
       
    });

    

    return res.redirect('donation.html');

});


app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('h.html');

}).listen(3000);

console.log("listening on port 30000");

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.collection('users').findOne({ 'email': email }, (err, result) => {
        if (err) {
            console.error("Error in finding user:", err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            if (!result) {
                console.log("User not found. Please sign up.");
                
                //res.status(404).json({ message: "User not found. Please sign up." });

                res.redirect('/login?error=User not found. Please sign up.');
            } else {
                if (result.password === password) {
                    console.log("Login successful");
                    // Redirect to donation.html after successful login
                    return res.redirect('donation.html');
                } else {
                    console.log("Wrong password entered. ");
                   // res.status(401).json({ message: "Wrong password entered. Consider changing password by visiting forgot password." });
                  
                   res.redirect('/login?error=Wrong password entered.');
                
                }
            }
        }
    });
});

var nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'brightshare.donate@gmail.com', // Replace with your email address
        pass: 'twqu rger azsy gzbm' // Replace with your email password
    }
});

app.post("/donateform", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var donationType = req.body.donationType;
    var quantity = req.body.quantity;

    var formData = {
        'name': name,
        'email': email,
        'phone': phone,
        'donationType': donationType,
        'quantity': quantity
    }

    // Insert form data into MongoDB
    db.collection('donations').insertOne(formData, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Donation Record Inserted Successfully");

        // Send email to the user with the donation details
        const mailOptions = {
            from: 'brightshare.donate@gmail.com', // Replace with your email address
            to: email,
            subject: 'Thank you for your donation!',
            html: `
                <p>Hello ${name},</p>
                <p>Thank you for your generous donation!</p>
                <p>Details of your donation:</p>
                <p>Donation Type: ${donationType}</p>
                <p>Quantity: ${quantity}</p>
                <p>We appreciate your support.</p>
                <p>Best regards,</p>
                <p>BrightShare</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });

   return res.redirect('thankyou.html'); // Redirect to a thank you page after form submission
});


// Error handling middleware for Multer upload errors
app.use(function (err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.status(500).json({ message: 'Multer upload error' });
    } else {
        next(err);
    }
});
