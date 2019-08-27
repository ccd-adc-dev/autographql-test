const koa = require('koa');
const mongoose = require('mongoose');
const graphqlHTTP = require('koa-graphql');
const mount = require('koa-mount')
const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose/node8');

const app = new koa()

mongoose.connect(`mongodb://mongo:27017/jcf`, {
  useNewUrlParser: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected. App running.'));



  
const PruebaSchema = new mongoose.Schema({
    nombre: String
});
  
const Prueba = mongoose.model('Prueba', PruebaSchema);


const customizationOptions = {}; // left it empty for simplicity, described below
const PruebaTC = composeWithMongoose(Prueba, customizationOptions);

// STEP 3: Add needed CRUD Prueba operations to the GraphQL Schema
// via graphql-compose it will be much much easier, with less typing
schemaComposer.Query.addFields({
  PruebaById: PruebaTC.getResolver('findById'),
  PruebaByIds: PruebaTC.getResolver('findByIds'),
  PruebaOne: PruebaTC.getResolver('findOne'),
  PruebaMany: PruebaTC.getResolver('findMany'),
  PruebaCount: PruebaTC.getResolver('count'),
  PruebaConnection: PruebaTC.getResolver('connection'),
  PruebaPagination: PruebaTC.getResolver('pagination'),
});

schemaComposer.Mutation.addFields({
  PruebaCreateOne: PruebaTC.getResolver('createOne'),
  PruebaCreateMany: PruebaTC.getResolver('createMany'),
  PruebaUpdateById: PruebaTC.getResolver('updateById'),
  PruebaUpdateOne: PruebaTC.getResolver('updateOne'),
  PruebaUpdateMany: PruebaTC.getResolver('updateMany'),
  PruebaRemoveById: PruebaTC.getResolver('removeById'),
  PruebaRemoveOne: PruebaTC.getResolver('removeOne'),
  PruebaRemoveMany: PruebaTC.getResolver('removeMany'),
});

const graphqlSchema = schemaComposer.buildSchema();
// export default graphqlSchema;


// console.log(graphqlSchema);


app.use(
    mount(
      '/graphql',
      graphqlHTTP({
        schema: graphqlSchema,
        graphiql: true
      })
    )
  );


app.listen(5000)