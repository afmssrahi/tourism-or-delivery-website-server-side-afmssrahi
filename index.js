const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5ozl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db('travelBari');
		const serviceCollection = database.collection('services');
		const bookingCollection = database.collection('bookings');

		// GET all services API
		app.get('/services', async (req, res) => {
			const cursor = serviceCollection.find({});
			const services = await cursor.toArray();
			res.json(services);
		});

		// GET single service API
		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const service = await serviceCollection.findOne(query);
			res.json(service);
		});

		// POST service API
		app.post('/services', async (req, res) => {
			const service = req.body;
			const result = await serviceCollection.insertOne(service);
			console.log(result);
			res.send(result);
		});

		// GET all booked tour API
		app.get('/bookings', async (req, res) => {
			const cursor = bookingCollection.find({});
			const bookedTours = await cursor.toArray();
			res.json(bookedTours);
		});

		// GET Logged in user's booked tours
		app.get('/bookings/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const cursor = bookingCollection.find(query);
			const bookings = await cursor.toArray();
			res.json(bookings);
		});

		// POST booking API
		app.post('/bookings', async (req, res) => {
			const booking = req.body;
			const result = await bookingCollection.insertOne(booking);
			res.send(result);
		});

		// DELETE API
		app.delete('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await bookingCollection.deleteOne(query);
			res.send(result);
		});

		// Update API
		app.put('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: 'approved',
				},
			};
			const result = await bookingCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
		});
	} finally {
		//   await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Running my Travel Bari Server');
});

app.listen(port, () => {
	console.log('listening to port', port);
});
