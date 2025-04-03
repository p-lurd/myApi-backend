package fetchjobs

import (
	"context"
	"fmt"
	"log"
	// "time"
	"os"

	"exmaple.com/go-routine/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"github.com/joho/godotenv"

	// "go.mongodb.org/mongo-driver/bson/primitive"
	// oldBson "gopkg.in/mgo.v2/bson"
)

// FetchJobs retrieves API jobs from MongoDB
func FetchJobs(client *mongo.Client) []models.ApiJob {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Error loading .env file")
	}
	dbName := os.Getenv("DB_NAME");

	apiCollection := client.Database(dbName).Collection("apis")
	
	cursor, err := apiCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatalf("❌ Error fetching API Jobs: %v", err)
	}
	defer cursor.Close(context.Background())

	var jobs []models.ApiJob
	for cursor.Next(context.Background()) {

		var job models.ApiJob
		if err := cursor.Decode(&job); err != nil {
			log.Println("❌ Error decoding API Job:", err)
			continue
		}

		// Log raw data for debugging
		log.Printf("Decoded Job: %+v", job)

		jobs = append(jobs, job)
	}

	fmt.Println("jobs:", jobs)
	fmt.Printf("✅ Found %d API jobs\n", len(jobs))
	return jobs
}

