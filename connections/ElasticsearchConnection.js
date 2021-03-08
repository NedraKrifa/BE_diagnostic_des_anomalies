const elasticsearch = require("elasticsearch");

const esClient = elasticsearch.Client({
    host: process.env.ELASTICSEARCH_HOST,
})

module.exports = esClient;