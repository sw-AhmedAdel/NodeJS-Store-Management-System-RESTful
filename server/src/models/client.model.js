const Client = require("./client.mysql");

async function FindClient(filter) {
  return await Client.findOne({
    where: filter,
  });
}

async function CreateClient(client) {
  const newClient = await Client.create(client);
  return newClient;
}

async function GetMyClients(filter) {
  const clients = await Client.findAll({
    where: filter,
  });
  return clients;
}

async function UpdateClient(client, newData) {
  await client.update(newData);
  return client.dataValues;
}

module.exports = {
  CreateClient,
  GetMyClients,
  FindClient,
  UpdateClient,
};
