import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DBNAME}`)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        throw error;
    }
}

export {
    connectDB
}