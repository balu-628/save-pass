const express = require('express');
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || 3000;
const url = 'mongodb+srv://admin-balu:Answer.com628@cluster0.gt42y.mongodb.net/';
mongoose.connect(url);


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.set('view engine', 'ejs');


// MongoDB Schema
const UserDB = mongoose.model('PasswordDB',{
    firstName:String,
    lastName:String,
    email:String,
    password:String,
    passwordDB:[
        {
         app:String,
         email:String,
         password:String

        }] 
});




// HOME PAGE

app.get('/',(req,res)=>{
	
	if(req.cookies._id){		
		UserDB.findOne({_id:req.cookies._id}).then((foundItems)=>{
			if(foundItems!=null){
					res.render('main',{data:foundItems.passwordDB});

			}else{
				res.redirect('/login');
			}
		})
	}else{		
	res.redirect('/login');
	}
})






// Login
app.get('/login',(req,res)=>{
					if(req.cookies._id){		
						UserDB.findOne({_id:req.cookies._id}).then((foundItems)=>{
							if(foundItems!=null){
								res.render('main',{data:foundItems.passwordDB});

							}
							else{
								res.render('login');
							}
						})
					}else{
						res.render('login')
					}
});


app.post('/login',(req,res)=>{

	UserDB.findOne({email:req.body.loginID}).then((foundItems)=>{
		if(foundItems!=null){
			if(foundItems.email==req.body.loginID && foundItems.password==req.body.loginPass){
				res.cookie("_id",foundItems._id)
				res.render('main',{data:foundItems.passwordDB});
			}
			else{
				res.redirect('/login');
			}
		}
		else{
			res.redirect('/login');
		}
	})
});






// Register
app.get('/register', (req,res)=>{
	res.render('register');		
});
app.post('/register',(req,res)=>{
	const newUser=new UserDB();
	newUser.firstName = req.body.fname;
	newUser.lastName=req.body.lname;
	newUser.email=req.body.email;
	newUser.password=req.body.password;
	newUser.save();
	res.redirect('/login');
});


// New Password entry
app.post('/newEntry',(req,res)=>{
	let newData = {
		app:req.body.app,
		email: req.body.email,
		password: req.body.pass 
	}
	UserDB.findOneAndUpdate({_id:req.cookies._id},{$push: { passwordDB: newData }}).then((foundItems)=>{

	res.redirect('/');
});
});


// DELETE
app.post("/delete",(req,res)=>{

UserDB.findOneAndUpdate(
		{_id:req.cookies._id},
		{
			$pull:{
				passwordDB:{_id:req.body.id}
			}
		}).then((foundItems)=>{
			res.redirect('/')

		});

});


//LOG OUT

app.get("/logout", (req, res) => {
  // clear the cookie
  res.clearCookie("_id");
  // redirect to login
  return res.redirect("/");
});




app.listen(port,()=>{
	console.log('Server running on port '+port);
});