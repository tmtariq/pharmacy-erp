import mongoose from 'mongoose';
import dns from 'dns';

// Ensure IPv4 DNS resolution for MongoDB Atlas SRV query resolution
try {
  if (dns && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore DNS order configuration error in serverless runtimes
}

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = 'mongodb://127.0.0.1:27017/pharmacy_erp';

    const uriToUse = primaryUri || fallbackUri;

    if (!primaryUri) {
      console.warn('⚠️ Warning: MONGO_URI environment variable is missing. Falling back to local MongoDB.');
    }

    cachedPromise = mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 15000
    }).then(conn => {
      console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }).catch(err => {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      throw err;
    });
  }

  return cachedPromise;
};

export default connectDB;