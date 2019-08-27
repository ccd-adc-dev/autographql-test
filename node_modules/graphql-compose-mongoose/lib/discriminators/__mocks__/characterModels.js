"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCharacterModels = getCharacterModels;
exports.getCharacterModelClone = getCharacterModelClone;
exports.CharacterObject = void 0;

var _mongooseCommon = require("../../__mocks__/mongooseCommon");

var _droidSchema = require("./droidSchema");

var _personSchema = require("./personSchema");

const enumCharacterType = {
  PERSON: 'Person',
  DROID: 'Droid'
};
const CharacterObject = {
  _id: {
    type: String,
    default: () => new _mongooseCommon.Types.ObjectId()
  },
  name: String,
  type: {
    type: String,
    require: true,
    enum: Object.keys(enumCharacterType)
  },
  kind: {
    type: String,
    require: true,
    enum: Object.keys(enumCharacterType)
  },
  friends: [String],
  // another Character
  appearsIn: [String] // movie

};
exports.CharacterObject = CharacterObject;
const CharacterSchema = new _mongooseCommon.Schema(CharacterObject);
const ACharacterSchema = new _mongooseCommon.Schema(Object.assign({}, CharacterObject));

function getCharacterModels(DKey) {
  CharacterSchema.set('discriminatorKey', DKey);
  const CharacterModel = _mongooseCommon.mongoose.models.Character ? _mongooseCommon.mongoose.models.Character : _mongooseCommon.mongoose.model('Character', CharacterSchema);
  const PersonModel = _mongooseCommon.mongoose.models[enumCharacterType.PERSON] ? _mongooseCommon.mongoose.models[enumCharacterType.PERSON] : CharacterModel.discriminator(enumCharacterType.PERSON, _personSchema.PersonSchema);
  const DroidModel = _mongooseCommon.mongoose.models[enumCharacterType.DROID] ? _mongooseCommon.mongoose.models[enumCharacterType.DROID] : CharacterModel.discriminator(enumCharacterType.DROID, _droidSchema.DroidSchema);
  return {
    CharacterModel,
    PersonModel,
    DroidModel
  };
}

function getCharacterModelClone() {
  const NoDKeyCharacterModel = _mongooseCommon.mongoose.model('NoDKeyCharacter', ACharacterSchema);
  /*
    const APersonModel = ACharacterModel.discriminator('A' + enumCharacterType.PERSON, PersonSchema.clone());
     const ADroidModel = ACharacterModel.discriminator('A' + enumCharacterType.DROID, DroidSchema.clone());
  */


  return {
    NoDKeyCharacterModel
  }; // APersonModel, ADroidModel };
}