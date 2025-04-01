package db

import (
	"context"
	"fmt"
	"log"
	"time"
	"os"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
	"github.com/joho/godotenv"
)

var Client *mongo.Client


func ConnectDB() *mongo.Client {
	// To get environmental variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Error loading .env file")
	}
	dbURL := os.Getenv("MONGODB_URI")


	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(dbURL))
	if err != nil {
		log.Fatal("MongoDB Connection Error:", err)
	}

	// defer func() {
	// 	if err = client.Disconnect(ctx); err != nil {
	// 		log.Fatal("Error Disconnecting MongoDB:", err)
	// 		// panic(err)
	// 	}
	// }()

	

	// _ = client.Ping(ctx, readpref.Primary())
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal("MongoDB Ping Failed:", err)
	}

	fmt.Println("Connected to MongoDB!")

	databases, err :=client.ListDatabaseNames(ctx,bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(databases);

	Client = client
	return client;
}


func DisconnectDB() {
	if Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := Client.Disconnect(ctx); err != nil {
			log.Fatal("❌ Error Disconnecting MongoDB:", err)
		} else {
			fmt.Println("✅ MongoDB Disconnected Successfully!")
		}
	}
}