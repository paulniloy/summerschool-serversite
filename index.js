const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000
var cors = require('cors')
var jwt = require('jsonwebtoken');

// 2j7FKakybpweZpVG
// niloypaul


app.use(cors());
app.use(express.json());

// TkWpj7Bshw0sdd7k
// niloypaul
console.log(process.env.password);
console.log(process.env.user_name);
console.log(process.env.token);





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    await client.connect();

    const db = client.db("summerschool");
    const classes = db.collection("popularclasses");
    const instructors = db.collection("popularinstructors");
    const instructorsdata = db.collection("instructors");
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
              roleB: "instructor"
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
        const result = await classes.find({students : {$gte : "50"}}).toArray();
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
        res.send(token)
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