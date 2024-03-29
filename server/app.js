const express = require("express");
const app = express();

const cors = require('cors');
//Handling CORS policy issue
//Need to mention cors option else data won't be saved in DB
const corsOptions = {
    origin: "http://localhost:5173", //frontend URL
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD", //Types of requests to accept from above URL
    credentials: true,
}
app.use(cors(corsOptions));

const {graphqlHTTP} = require("express-graphql")

const dotenv = require('dotenv')
dotenv.config({path: './config.env'});


const connectDB = require("./db/conn");

//Fetch PORT number from config file 
const PORT = process.env.PORT

//import schema
const schema = require("./schema/schema")

//We will use graphql by adding it as a middleware at a route
//The below code will trigger graphqlHTTP() with options when someone hits /graphql route
app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}));

connectDB().then(() =>{
    app.listen(PORT, ()=>{
        console.log(`ExpressJs listening at: http://localhost:${PORT}`);
    })
})