const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// medlwer
// const corsOptions = {
//   origin: [
//     'http://localhost:5173',
//     'https://my-car-calain-saite.web.app',
//     'https://my-car-calain-saite.firebaseapp.com',
//   ],
//   credentials: true,
//   optionSuccessStatus: 200,
// }
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://my-car-calain-saite.web.app',
    'https://my-car-calain-saite.firebaseapp.com'
  ],
  credentials: true
}));

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


const coceoption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
}

async function run() {
  try {
    const carCallection = client.db('car').collection('carCallection');
    const orderCallection = client.db('car').collection('orderCallection');
    const mraqueeDataCallection = client.db('car').collection('mraqueeData');


    //  Jwt relatedApi
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log(user);
      res
        .cookie('accessToken', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'none',
        })

        .send({ success: true })
    })


    // delete api 
    app.post('/loguot', async (req, res) => {
      const user = req.body;
      res.clearCookie('token', { ...coceoption, maxAge: 0 }).send({ success: true })
    })

    // carCallection
    app.get('/mraquee', async (req, res) => {
      const corsur = mraqueeDataCallection.find();
      const result = await corsur.toArray();
      res.send(result)
    })
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
    app.get('/orderss', async (req, res) => {
      const corsur = orderCallection.find();
      const result = await corsur.toArray();
      res.send(result)
    })

    app.get('/singleOrders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await orderCallection.findOne(query)
      res.send(result)
    })

    app.get('/orders', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await orderCallection.find(query).toArray();
      res.send(result)
    })
    app.get('/request', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await carCallection.find(query).toArray();
      res.send(result)
    })
    
    app.get('/order', async (req, res) => {
      const corsur = orderCallection.find();
      const result = await corsur.toArray();
      res.send(result)
    })

    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCallection.insertOne(order)
      res.send(result)
    })
    app.post('/request', async (req, res) => {
      const request = req.body;
      const result = await carCallection.insertOne(request)
      res.send(result)
    })

    app.delete('/orders/:id', logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await orderCallection.deleteOne(query)
      res.send(result)
    })

    // logger
    app.patch('/updateFood/:id', async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          name: updateOrder.name,
          email: updateOrder.email,
          donator_image: updateOrder.donator_image,
          food_image: updateOrder.food_image,
          food_quantity: updateOrder.food_quantity,
          date: updateOrder.date,
          additional_notes: updateOrder.additional_notes,
          pickup_location: updateOrder.pickup_location,
        },
      };

      const result = await orderCallection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {


  }
}
run().catch(console.dir);

app.post('/send-message', (req, res) => {
  const { message } = req.body;
  // Process the message, send notifications, etc.
  console.log(`Received message: ${message}`);
  res.send({ success: true });
});

app.get('/', (req, res) => {
  res.send('eliven assainment runing')
})

app.listen(port, () => {
  console.log(`eliven assainment runing ${port}`);
})