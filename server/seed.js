const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Driver = require('./models/Driver');
const Payment = require('./models/Payment');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const pickupDropPairs = [
  {
    pickup: { address: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
    drop: { address: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
    distance: 4.6,
    duration: 16
  },
  {
    pickup: { address: 'Karol Bagh, New Delhi', lat: 28.6518, lng: 77.1909 },
    drop: { address: 'Lajpat Nagar, New Delhi', lat: 28.5677, lng: 77.2433 },
    distance: 13.4,
    duration: 34
  },
  {
    pickup: { address: 'Saket, New Delhi', lat: 28.5245, lng: 77.2066 },
    drop: { address: 'Hauz Khas, New Delhi', lat: 28.5494, lng: 77.2001 },
    distance: 5.2,
    duration: 18
  },
  {
    pickup: { address: 'Dwarka Sector 10, New Delhi', lat: 28.5811, lng: 77.0575 },
    drop: { address: 'Aerocity, New Delhi', lat: 28.5512, lng: 77.1214 },
    distance: 8.7,
    duration: 23
  },
  {
    pickup: { address: 'Rohini West, New Delhi', lat: 28.7149, lng: 77.1155 },
    drop: { address: 'Pitampura, New Delhi', lat: 28.7034, lng: 77.1327 },
    distance: 3.8,
    duration: 14
  },
  {
    pickup: { address: 'Noida Sector 18, Uttar Pradesh', lat: 28.5708, lng: 77.3261 },
    drop: { address: 'Akshardham, New Delhi', lat: 28.6127, lng: 77.2773 },
    distance: 9.8,
    duration: 28
  }
];

const rates = {
  Auto: { base: 30, perKm: 8 },
  Sedan: { base: 50, perKm: 12 },
  SUV: { base: 80, perKm: 18 }
};

/**
 * Calculates sample fare for seed rides using the same rules as the client.
 *
 * @param {'Auto'|'Sedan'|'SUV'} vehicleType - Vehicle type.
 * @param {number} distance - Distance in kilometers.
 * @returns {number}
 */
const calculateSeedFare = (vehicleType, distance) =>
  Math.round(rates[vehicleType].base + rates[vehicleType].perKm * distance);

/**
 * Resets the database and creates demo passengers, drivers, rides, and payments.
 *
 * @returns {Promise<void>}
 */
const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Ride.deleteMany({}),
    Payment.deleteMany({})
  ]);

  const passengers = await User.create([
    {
      name: 'Rahul Sharma',
      email: 'passenger1@rydo.com',
      password: 'pass123',
      phone: '9876543210'
    },
    {
      name: 'Priya Singh',
      email: 'passenger2@rydo.com',
      password: 'pass123',
      phone: '9876543211'
    }
  ]);

  const drivers = await Driver.create([
    {
      name: 'Amit Kumar',
      email: 'driver1@rydo.com',
      password: 'pass123',
      phone: '9876543220',
      vehicleType: 'Auto',
      vehicleNumber: 'DL 01 AB 1234',
      licenseNumber: 'DL-AUTO-1001',
      rating: { average: 4.6, count: 18 }
    },
    {
      name: 'Suresh Yadav',
      email: 'driver2@rydo.com',
      password: 'pass123',
      phone: '9876543221',
      vehicleType: 'Sedan',
      vehicleNumber: 'DL 02 CD 5678',
      licenseNumber: 'DL-SEDAN-1002',
      rating: { average: 4.8, count: 21 }
    },
    {
      name: 'Ravi Gupta',
      email: 'driver3@rydo.com',
      password: 'pass123',
      phone: '9876543222',
      vehicleType: 'SUV',
      vehicleNumber: 'DL 03 EF 9012',
      licenseNumber: 'DL-SUV-1003',
      rating: { average: 4.5, count: 15 }
    }
  ]);

  const now = new Date();
  const rideDocs = pickupDropPairs.map((pair, index) => {
    const driver = drivers[index % drivers.length];
    const passenger = passengers[index % passengers.length];
    const fare = calculateSeedFare(driver.vehicleType, pair.distance);
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - index);

    return {
      passengerId: passenger._id,
      driverId: driver._id,
      pickup: pair.pickup,
      drop: pair.drop,
      status: 'completed',
      vehicleType: driver.vehicleType,
      fare,
      distance: pair.distance,
      duration: pair.duration,
      paymentMethod: index % 2 === 0 ? 'online' : 'cod',
      paymentStatus: 'paid',
      razorpayOrderId: index % 2 === 0 ? `order_seed_${index + 1}` : '',
      razorpayPaymentId: index % 2 === 0 ? `pay_seed_${index + 1}` : '',
      otp: `${4821 + index}`,
      passengerRating: 4 + (index % 2),
      createdAt
    };
  });

  const rides = await Ride.create(rideDocs);

  await Payment.create(
    rides.map((ride) => ({
      rideId: ride._id,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      amount: ride.fare,
      method: ride.paymentMethod,
      status: 'paid',
      razorpayOrderId: ride.razorpayOrderId,
      razorpayPaymentId: ride.razorpayPaymentId,
      createdAt: ride.createdAt
    }))
  );

  await Promise.all(
    drivers.map((driver) => {
      const total = rides
        .filter((ride) => ride.driverId.toString() === driver._id.toString())
        .reduce((sum, ride) => sum + ride.fare, 0);

      return Driver.findByIdAndUpdate(driver._id, { totalEarnings: total });
    })
  );

  console.log('Seed data inserted successfully');
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
