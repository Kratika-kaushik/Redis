# Redis

Redis is applied with mongoDB. The data stored in mongoDB is first checked in redis, if present 
send the response back to API call from redis otherwise send the response from MongoDB and store
it in redis.
