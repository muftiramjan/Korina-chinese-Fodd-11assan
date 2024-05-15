const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// medlwer
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://my-car-calain-saite.web.app',
    'https://my-car-calain-saite.firebaseapp.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyzkzxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// meddlewares
const logger = async (req, res, next) => {
  console.log('colde', req.host, req.originalUrl);
  next();
}

const verifToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log('value of meddelewre', token);
  if (!token) {
    return res.status(401).send({ Message: 'forbiddin' })
  }

  jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).sen({ massege: 'anathoraged' })
    }
    console.log('value of tha token', decoded);
    req.user = decoded;
    next();
  })
}
const coceoption={
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
}

async function run() {
  try {
    const carCallection = client.db('car').collection('carCallection');
    const orderCallection = client.db('car').collection('orderCallection');

    // jwt related
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: '1h' });
      res
        .cookie('token', token, coceoption)
        .send({ success: true })
    })


    app.post('/loguot', async (req, res) => {
      const user = req.body;
      res.clearCookie('token', {...coceoption, maxAge: 0 }).send({ success: true })
    })

    // carCallection
    app.get('/carServes', async (req, res) => {
      const corsur = carCallection.find();
      const result = await corsur.toArray();
      res.send(result)
    })

    app.get('/carServes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCallection.findOne(query);
      res.send(result)
    })

    app.get('/available/:id', async (req, res) => {
      const id = req.params.id;
      
      const query = { _id: new ObjectId(id) };
      const result = await orderCallection.findOne(query);
      res.send(result)
    })

    // orderCallection 
app.get('/orderss',async(req,res) => {
  const corsur=orderCallection.find();
  const result=await corsur.toArray();
  res.send(result)
})

app.get('/orders:id', logger,verifToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const options = {
    // Include only the `title` and `imdb` fields in the returned document
    projection: {
      _id: 1, food_name: 1, food_image: 1, donator_image: 1,
      donator_name: 1, food_quantity: 1, expired_datetime: 1, additional_notes: 1, pickup_location: 1,
    },
  };

  const result = await orderCallection.findOne(query,options)
  res.send(result)
})

    app.get('/orders', logger, verifToken, async (req, res) => {
      console.log(req.query.email);
      console.log('tok tik khan', req.cookies.token);
      if (req.query.email !== req.user.email) {
        return res.status(403).send({ massage: 'forbidden' })
      };
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await orderCallection.find(query).toArray();
      res.send(result)
    })



    app.post('/order', async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await orderCallection.insertOne(order)
      res.send(result)
    })

    app.delete('/orders/:id', logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await orderCallection.deleteOne(query)
      res.send(result)
    })
   

    app.patch('/orders/:id', logger, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateOrder = req.body;
      console.log(updateOrder);

      const updateDoc = {
        $set: {
          status: updateOrder.status
        }
      };
      const result = await orderCallection.updateOne(filter, updateDoc);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('doctor is runig')
})

app.listen(port, () => {
  console.log(`doctor servr is comming son ${port}`);
})