package processjobs

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"weup.com/go-routine/models"
)

// ProcessAndStoreAPIResponse handles API calls and stores responses
func ProcessAndStoreAPIResponse(job models.ApiJob, client *mongo.Client) {
	startTime := time.Now()

	// Try to load development environment by default for local runs
    // This will be silently ignored in Docker since Docker uses env_file
	err := godotenv.Load(".env.development")
    if err != nil {
        log.Printf("Note: Could not load .env.development file (this is normal in Docker)")
    }
	dbName := os.Getenv("DB_NAME")

	clientHTTP := http.Client{Timeout: 5 * time.Second}
	var url = job.URL
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}
	resp, err := clientHTTP.Get(url)

	elapsedTime := time.Since(startTime).Milliseconds()
	now := time.Now()
	apiResponse := models.ApiResponse{
		URL:          job.URL,
		ApiName:      job.ApiName,
		ApiID:        job.ID,
		BusinessID:   job.BusinessID,
		ResponseTime: elapsedTime,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err != nil {
		fmt.Println("the error from getting page:", err)
		apiResponse.StatusCode = 0
		apiResponse.Success = false
	} else {
		defer resp.Body.Close()
		apiResponse.StatusCode = resp.StatusCode
		// This is because if unauthorized, it means the api is still active
		apiResponse.Success = resp.StatusCode < 500
	}

	// Store response in MongoDB
	apiResponseCollection := client.Database(dbName).Collection("apiresponses")
	_, err = apiResponseCollection.InsertOne(context.Background(), apiResponse)
	if err != nil {
		log.Fatal("❌ Error saving API response:", err)
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
