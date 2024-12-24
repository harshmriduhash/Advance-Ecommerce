import mongoose from 'mongoose'


const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        
        console.log("MongoDb connected successfully")
    } catch (error) {
        console.log("MongoDb connection failed", error)
        process.exit(1);
    }
}
export default connectDb;