module.exports = {

  database: 'mongodb://me:k4cV6oprIxi9sBKq@cluster0-shard-00-00-jt7lz.mongodb.net:27017,cluster0-shard-00-01-jt7lz.mongodb.net:27017,cluster0-shard-00-02-jt7lz.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',
  port: process.env.PORT || 3030,
  secret: process.env.SECRET || 'fiverrclone2222',

}
