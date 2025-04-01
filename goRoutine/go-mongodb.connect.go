package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)


func Database () {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("MongoDB Connection Error:", err)
	}

	defer func() {
		if err = client.Disconnect(ctx); err != nil {
			log.Fatal("Error Disconnecting MongoDB:", err)
			// panic(err)
		}
	}()

	

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
}