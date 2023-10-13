// src/database.js
import weaviate, { ApiKey } from "weaviate-ts-client";
import { config } from "dotenv";
import { FAKE_XORDIA_HISTORY } from "./data.js";

config();

async function setupClient() {
  let client;

  try {
    if (
      !process.env.WEAVIATE_URL ||
      !process.env.WEAVIATE_API_KEY ||
      !process.env.OPENAI_KEY
    )
      throw new Error("Missing env variables(WEAVIATE_URL, WEAVIATE_API_KEY, OPENAI_API_KEY)");

    client = weaviate.client({
      scheme: "https",
      host: process.env.WEAVIATE_URL,
      apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
      headers: { "X-OpenAI-Api-Key": process.env.OPENAI_KEY },
    });
  } catch (err) {
    console.error("error >>>", err.message);
  }

  return client;
}

async function migrate(shouldDeleteAllDocuments = false) {
  try {
    const classObj = {
      class: process.env.DATA_CLASSNAME,
      vectorizer: "text2vec-openai",
      moduleConfig: {
        "text2vec-openai": {
          model: "ada",
          modelVersion: "002",
          type: "text",
        },
      },
    };

    const client = await setupClient();

    try {
      const schema = await client.schema
        .classCreator()
        .withClass(classObj)
        .do();
      console.info("created schema >>>", schema);
    } catch (err) {
      console.error("schema already exists");
    }

    if (!FAKE_XORDIA_HISTORY.length) {
      console.error(`Data is empty`);
      process.exit(1);
    }

    if (shouldDeleteAllDocuments) {
      console.info(`Deleting all documents`);
      await deleteAllDocuments();
    }

    console.info(`Inserting documents`);
    await addDocuments(FAKE_XORDIA_HISTORY);
  } catch (err) {
    console.error("error >>>", err.message);
  }
}

const addDocuments = async (
  data = []
) => {
  const client = await setupClient();
  let batcher = client.batch.objectsBatcher();
  let counter = 0;
  const batchSize = 100;

  for (const document of data) {
    const obj = {
      class: process.env.DATA_CLASSNAME,
      properties: { ...document },
    };

    batcher = batcher.withObject(obj);
    if (counter++ == batchSize) {
      await batcher.do();
      counter = 0;
      batcher = client.batch.objectsBatcher();
    }
  }

  const res = await batcher.do();
  return res;
};

async function deleteAllDocuments() {
  const client = await setupClient();
  const documents = await client.graphql
    .get()
    .withClassName(process.env.DATA_CLASSNAME)
    .withFields("_additional { id }")
    .do();

  if (!process.env.DATA_CLASSNAME) throw new Error("Missing env variables(DATA_CLASSNAME)");

  for (const document of documents.data.Get[process.env.DATA_CLASSNAME]) {
    await client.data
      .deleter()
      .withClassName(process.env.DATA_CLASSNAME)
      .withId(document._additional.id)
      .do();
  }
}

async function nearTextQuery({
  concepts = [""],
  fields = "text category",
  limit = 1,
}) {
  if (!process.env.DATA_CLASSNAME) throw new Error("Missing env variables(DATA_CLASSNAME)");
  const client = await setupClient();
  const res = await client.graphql
    .get()
    .withClassName("Document")
    .withFields(fields)
    .withNearText({ concepts })
    .withLimit(limit)
    .do();

  console.log(res.data.Get[process.env.DATA_CLASSNAME])
  console.log(res.data.Get[process.env.DATA_CLASSNAME].length)

  return res.data.Get[process.env.DATA_CLASSNAME];
}

export { migrate, addDocuments, deleteAllDocuments, nearTextQuery };
