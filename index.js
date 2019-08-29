const koa = require('koa');
const mongoose = require('mongoose');
const graphqlHTTP = require('koa-graphql');
const mount = require('koa-mount')
const { schemaComposer } = require('graphql-compose');
const { composeWithMongoose } = require('graphql-compose-mongoose');

const app = new koa()

mongoose.connect(`mongodb://mongo:27017/padrehijo`, {
  useNewUrlParser: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected. App running.'));


const PadreSchema = new mongoose.Schema({
    nombre: String,
    hijosIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hijo'
    }]
});

const HijoSchema = new mongoose.Schema({
    nombre: String,
    padreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Padre'
    }
});
  
const Padre = mongoose.model('Padre', PadreSchema);
const Hijo = mongoose.model('Hijo', HijoSchema);

let nuevoPadre = new Padre({nombre: 'Padre 1'})
nuevoPadre.save().then(res => {
  padreId = res._id
  let hijo1 = new Hijo({ nombre: 'hijo1', padreId: padreId } )
  let hijo2 = new Hijo({ nombre: 'hijo2', padreId: padreId } )
  promesa1 = hijo1.save()
  promesa2 = hijo2.save()

  Promise.all([promesa1, promesa2]).then(res=> {
    nuevoPadre.hijosIds = [res[0]._id, res[1]._id]
    nuevoPadre.save()
  })
})

const customizationOptions = {}; // left it empty for simplicity, described below
const PadreTC = composeWithMongoose(Padre, customizationOptions);
const HijoTC = composeWithMongoose(Hijo, customizationOptions);

PadreTC.addRelation(
  'hijos',
  {
    resolver: () => HijoTC.getResolver('findByIds'),
    prepareArgs: { // resolver `findByIds` has `_ids` arg, let provide value to it
      _ids: (source) => source.hijosIds,
    },
    projection: { hijosIds: 1 }, // point fields in source object, which should be fetched from DB
  }
)

HijoTC.addRelation(
  'padre',
  {
    resolver: () => PadreTC.getResolver('findById'),
    prepareArgs: { // resolver `findByIds` has `_ids` arg, let provide value to it
      _id: (source) => source.padreId,
    },
    projection: { padreId: 1 }, // point fields in source object, which should be fetched from DB
  }
)

// STEP 3: Add needed CRUD Padre operations to the GraphQL Schema
// via graphql-compose it will be much much easier, with less typing
schemaComposer.Query.addFields({
  PadreById: PadreTC.getResolver('findById'),
  PadreByIds: PadreTC.getResolver('findByIds'),
  PadreOne: PadreTC.getResolver('findOne'),
  PadreMany: PadreTC.getResolver('findMany'),
  PadreCount: PadreTC.getResolver('count'),
  PadreConnection: PadreTC.getResolver('connection'),
  PadrePagination: PadreTC.getResolver('pagination'),
  HijoById: HijoTC.getResolver('findById'),
  HijoByIds: HijoTC.getResolver('findByIds'),
  HijoOne: HijoTC.getResolver('findOne'),
  HijoMany: HijoTC.getResolver('findMany'),
  HijoCount: HijoTC.getResolver('count'),
  HijoConnection: HijoTC.getResolver('connection'),
  HijoPagination: HijoTC.getResolver('pagination'),
});

schemaComposer.Mutation.addFields({
  PadreCreateOne: PadreTC.getResolver('createOne'),
  PadreCreateMany: PadreTC.getResolver('createMany'),
  PadreUpdateById: PadreTC.getResolver('updateById'),
  PadreUpdateOne: PadreTC.getResolver('updateOne'),
  PadreUpdateMany: PadreTC.getResolver('updateMany'),
  PadreRemoveById: PadreTC.getResolver('removeById'),
  PadreRemoveOne: PadreTC.getResolver('removeOne'),
  PadreRemoveMany: PadreTC.getResolver('removeMany'),
  HijoCreateOne: HijoTC.getResolver('createOne'),
  HijoCreateMany: HijoTC.getResolver('createMany'),
  HijoUpdateById: HijoTC.getResolver('updateById'),
  HijoUpdateOne: HijoTC.getResolver('updateOne'),
  HijoUpdateMany: HijoTC.getResolver('updateMany'),
  HijoRemoveById: HijoTC.getResolver('removeById'),
  HijoRemoveOne: HijoTC.getResolver('removeOne'),
  HijoRemoveMany: HijoTC.getResolver('removeMany'),
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