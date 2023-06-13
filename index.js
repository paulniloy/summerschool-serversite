const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000
var cors = require('cors')
var jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.payment);

// 2j7FKakybpweZpVG
// niloypaul


app.use(cors());
app.use(express.json());

// TkWpj7Bshw0sdd7k
// niloypaul
console.log(process.env.password);
console.log(process.env.payment);
console.log(process.env.user_name);
console.log(process.env.token);




    const verifyjwt=(req,res,next)=>{
        const authtoken = req.headers.authorization;
        if(!authtoken){
            return res.send({error: true, message : "unauthorized"});
        }
        const token = authtoken.split(' ')[1];
        jwt.verify(token, process.env.token, (err, decoded)=>{
            if(err){
                return res.status(401).send({error: true, message : 'token expired'});
            }
            req.decoded = decoded;
            next();
        })
    }


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: Stripe } = require('stripe')
const uri = `mongodb+srv://${process.env.user_name}:${process.env.password}@paulniloy.38wqfao.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("summerschool");
    const classes = db.collection("popularclasses");
    const instructors = db.collection("popularinstructors");
    const instructorsdata = db.collection("instructors");
    const paiddata = db.collection("paidusers");
    const pending = db.collection("pending");



// instructors page
    app.post('/instructors', async(req,res)=>{
        const user = req.body;
        const query = {email : user.email};
        const existing = await instructorsdata.findOne(query);
        if(existing){
            return res.send({message : "already existed user"})
        }
        const result = await instructorsdata.insertOne(user);
        res.send(result)
    })
    app.get('/instructors', async(req,res)=>{
        const result = await instructorsdata.find().toArray();
        res.send(result)
    })

    // manage by admin

    app.patch("/instructors/makeadmin/:id" , async(req,res)=>{
        const id = req.params.id
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
              role: "admin"
            },
          };
        const result = instructorsdata.updateOne(filter, updateDoc);
        res.send(result)
    })
    app.patch("/instructors/makeinstructor/:id" , async(req,res)=>{
        const id = req.params.id
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
              role: "instructor"
            },
          };
        const result = instructorsdata.updateOne(filter, updateDoc);
        res.send(result)
    })

    app.delete("/users/delete/:id", async(req,res)=>{
        const id = req.params.id;
        console.log(id);
        const query = { _id : new ObjectId(id) };
        const result = await instructorsdata.deleteOne(query);
        res.send(result)
    })



// popular classes section
    app.get('/popclasses', async(req, res)=>{
        const query = {status : "approved"};
        const options = {sort: { "students": -1 }}
        const result = await classes.find(query, options,{"students" : {$gte : "60"}}).toArray();
        res.send(result)
    })
    app.get('/popinstructors', async(req, res)=>{
        const result = await instructors.find().toArray();
        res.send(result)
    })

    // jwt token
    app.post('/jwt', (req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.token, { expiresIn: '1h' });
        res.send({token})
    })

    //fetch instructors by roleB

    app.get('/instructorpage', async(req,res)=>{
        const query = {roleB : "instructor"};
        const result = await instructorsdata.find(query).toArray();
        res.send(result)

    })

    //pending route

    app.post('/pending', async(req,res)=>{
        const userinfo = req.body;
        const result = await classes.insertOne(userinfo);
        res.send(result);
    })
    app.get('/getpending', async(req,res)=>{
        const query = {status : 'pending'}
        const result = await classes.find(query).toArray();
        res.send(result) 
    })
    app.patch('/feedbacksend/:id', async(req,res)=>{
        const userid = req.params.id;
        const body = req.body;
        console.log(body);
        const query = {_id : new ObjectId(userid)};
        const updateDoc = {
            $set: {
              feedback: body.denieddata,
              status : body.status
            },
          };
        const result = await classes.updateOne(query,updateDoc);
        res.send(result)
    })

    // add pending to database

    app.patch('/addtoclasses/:id', async(req,res)=>{
        const id = req.params.id;
        const filter = { _id : new ObjectId(id)}
        const updateDoc = {
            $set: {
              status: "approved"
            },
          };
        const result = await classes.updateOne(filter, updateDoc);
        res.send(result)

    })


    // showind classes to route

    app.get("/userclasses", verifyjwt, async(req,res)=>{
        const email = req.query.email;
        const decodedemail = req.decoded.email;
        if(email !== decodedemail){
            return res.send({message : "unauthorised"})
        }
        const query = { instructor_email : email};
        const result = await classes.find(query).toArray();
        res.send(result)
    })

    // update data 

    app.patch("/update/:id", async(req,res)=>{
        const id = req.params.id;
        console.log(id);
        const data = req.body;
        console.log(data);
        const query = {_id : new ObjectId(id)};
        const updateDoc = {
            $set: {
              music_name : data.music_name,
              image : data.image,
              price : data.price,
              available_seats : data.available_seats
            },
          };
          const result = await classes.updateOne(query, updateDoc);
          res.send(result)
    })

    app.get('/getitem/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await classes.findOne(query);
        res.send(result)
    })


    // showall classes

    app.get("/allclasses", async(req,res)=>{
        const query = { "available_seats" : {$gt : "0"}, status : "approved"}
        const result = await classes.find(query).toArray();
        res.send(result)
    })

    // pending route

    app.patch('/setpending/:id',async(req,res)=>{
        const id = req.params.id;
        const body = req.body;
        const query = {_id : new ObjectId(id)};
        const updateDoc = {
            $set: {
              enrolled: "pending",
              enrolledby : body.username
            },
          };
        const result = await classes.updateOne(query, updateDoc);
        res.send(result);
    })

    app.get('/getenrolled',async(req,res)=>{
        const query = {enrolled : "successful"}
        const result = await paiddata.find(query).toArray();
        res.send(result);
    })
    app.get('/payment',async(req,res)=>{
        const email = req.query.email;
        const query = {enrolledby : email}
        const result = await classes.find(query).toArray();
        res.send(result);
    })

    // is admin check
    app.get('/user/admin/:email', async(req,res)=>{
        const email = req.params.email;
        const query = { email : email};
        const user = await instructorsdata.findOne(query);
        const result = { role : user?.role === "admin"};
        res.send(result);
    })

    // is instructor check
    app.get('/user/instructor/:email', async(req,res)=>{
        const email = req.params.email;
        const query = { email : email};
        const user = await instructorsdata.findOne(query);
        const result = { role : user?.role === "instructor"};
        res.send(result);
    })
    // //student check
    app.get('/user/student/:email', async(req,res)=>{
        const email = req.params.email;
        const query = { email : email};
        const user = await instructorsdata.findOne(query);
        const result = { role : user?.role === "student"};
        res.send(result);
    })

    //payment method

    app.post ('/create-payment-intent', async(req,res)=>{
        const {price} = req.body;
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
            amount : amount,
            currency : 'usd',
            payment_method_types : ['card']
        });
        res.send({
            clientSecret : paymentIntent.client_secret
        })
    })

    //paid classes 
    app.post("/paidclasses", async(req,res)=>{
        const data = req.body;
        const result = await paiddata.insertOne(data);
        res.send(result);
    })
    app.get('/getpaidclasses', async(req,res)=>{
        const email = req.query.email;
        const query = {email : email};
        const result = await paiddata.find(query).toArray();
        res.send(result);
    })
    app.patch('/removepending',async(req,res)=>{
        const email = req.body;
        const query = { enrolledby : email};
        const updateDoc = {
            $set: {
              enrolled: ""
            },
          };
        const result = await classes.updateMany(query, updateDoc);
        res.send(result);
    })


    // class details new

    app.post('/settedpending', async(req,res)=>{
        const data = req.body;
        const query = {item : data.item}
        const existing = await classes.findOne(query);
        if(existing){
            return res.send({message : "already existed user"})
        }
        const result = await classes.insertOne(data);
        res.send(result);
    })
    app.get('/pendingdata', async(req,res)=>{
        const email = req.query.email;
        const query = {enrolledby : email}
        const result = await classes.find(query).toArray();
        res.send(result);
    })
    app.delete('/backnormal/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await classes.deleteOne(query);
        res.send(result);
    })

    // delete after payment

    app.delete('/deletecartdata', async(req,res)=>{
        const email = req.query.email;
        const query = {enrolledby : email};
        const result = await classes.deleteMany(query);
        res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello jahnkar vai!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})