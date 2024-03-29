const graphql = require("graphql")
const _ = require("lodash")

const Book = require("../models/book");
const Author = require("../models/author");

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull} = graphql

//We will have two object types
//Books and Authors
//We also need to define relation between them and how to query data

//Creating Structure for Book
const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({ //We ned to wrap all props of the obeject in function called fields
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},    
            
        author: {
            type: AuthorType,
            resolve(parent, args){
                console.log(parent); //Here parent is Book
                return Author.findById(parent.authorId)
                //Return author details based on authorId
            }
        }
    })
})

//Creating structure for Author
const AuthorType = new GraphQLObjectType({
    name: "Author",
    fields: ()=> ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},

        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                //I want to query all books written by this author
                return Book.find({authorId: parent.id});
            }
        }
    })
})

//We need to define the entry point for user in using GraphQL query
//User can try to access Book via Id or the Author as well
//So we define the start points which user can pick, Book or Author based on what he wants to fetch
//To wrap these start points we define a Root Query

//Wrapping all defined structures above in RootQuery
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}}, //When user tries to access a particular book, he must pass the Id along it
            resolve(parent, args){
                //Below code will fetch a book based on Id
                return Book.findById(args.id);
            }
        },

        author: {
            type: AuthorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Author.findById(args.id);
            }
        },

        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                //Empty object retrieves all books
                return Book.find({});
            }
        },

        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return Author.find({})
            }
        }

    }
})


const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addAuthor : {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parent, args){
                //We need to add the new author in MongoDB
                //So we will create an instance of Model defined for MongoDB
                const newAuthor = new Author({
                    name: args.name,
                    age: args.age
                });

                //This will automatically save the newly created author in Mongo DB
                return newAuthor.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const newBook = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });

                return newBook.save();
            }
        }
    }
})

//We need to export the schema 
//Exporting RootType to outer world, to access graphQL
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})