package processjobs

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"exmaple.com/go-routine/models"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

// ProcessAndStoreAPIResponse handles API calls and stores responses
func ProcessAndStoreAPIResponse(job models.ApiJob, client *mongo.Client) {
	startTime := time.Now()

	clientHTTP := http.Client{Timeout: 5 * time.Second}
	resp, err := clientHTTP.Get(job.URL)

	elapsedTime := time.Since(startTime).Milliseconds()
	apiResponse := models.ApiResponse{
		URL:          job.URL,
		ApiID:        job.ID,
		BusinessID:   job.BusinessID,
		ResponseTime: elapsedTime,
	}

	if err != nil {
		apiResponse.StatusCode = 0
		apiResponse.Success = false
	} else {
		defer resp.Body.Close()
		apiResponse.StatusCode = resp.StatusCode
		apiResponse.Success = resp.StatusCode >= 200 && resp.StatusCode < 300
	}

	// Store response in MongoDB
	apiResponseCollection := client.Database("your_database_name").Collection("api_responses")
	_, err = apiResponseCollection.InsertOne(context.Background(), apiResponse)
	if err != nil {
		log.Println("❌ Error saving API response:", err)
	} else {
		fmt.Printf("✅ Saved API response for %s (Status: %d)\n", job.URL, apiResponse.StatusCode)
	}
}

// ProcessJobsConcurrently runs jobs in parallel
func ProcessJobsConcurrently(jobs []models.ApiJob, client *mongo.Client) {
	var wg sync.WaitGroup

	for _, job := range jobs {
		wg.Add(1)
		go func(job models.ApiJob) {
			defer wg.Done()
			ProcessAndStoreAPIResponse(job, client)
		}(job)
	}

	wg.Wait()
	fmt.Println("✅ All API jobs processed successfully.")
}
