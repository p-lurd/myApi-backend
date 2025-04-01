package fetchjobs

import (
	"context"
	"fmt"
	"log"

	"exmaple.com/go-routine/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// FetchJobs retrieves API jobs from MongoDB
func FetchJobs(client *mongo.Client) []models.ApiJob {
	apiCollection := client.Database("your_database_name").Collection("api_jobs")

	// Fetch jobs
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
		jobs = append(jobs, job)
	}

	fmt.Printf("✅ Found %d API jobs\n", len(jobs))
	return jobs
}
