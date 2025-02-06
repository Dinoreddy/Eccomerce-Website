import mongoose from "mongoose"

export const MonogoDB = async()=>{
    try {
        const conn = mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connexted ${(await conn).connection.host}`)
    
} catch (error) {
    console.log(error)
    process.exit(1)
}}