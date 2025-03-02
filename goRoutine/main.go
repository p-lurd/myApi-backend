package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()


type ApiJob struct {
	ID         string `json:"id"` 
	URL        string `json:"url"`
	BusinessID string `json:"businessId"`
	Options      any    `json:"options,omitempty"`
}


type ApiResponse struct {
	URL          string `json:"url"`
	ApiID        string `json:"apiId"`
	StatusCode   int    `json:"statusCode"`
	ResponseTime int64  `json:"responseTime"`
	Success      bool   `json:"success"`
	BusinessID   string `json:"businessId"`
}
func processAPI(job ApiJob) ApiResponse {
	startTime := time.Now()

	client := http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(job.URL)

	elapsedTime := time.Since(startTime).Milliseconds()
	apiResponse := ApiResponse{
		URL:          job.URL,
		ApiID:        job.ID,
		BusinessID:   job.BusinessID,
		ResponseTime: elapsedTime,
	}

	if err != nil {
		apiResponse.StatusCode = 0 
		apiResponse.Success = false
		return apiResponse
	}
	defer resp.Body.Close()

	apiResponse.StatusCode = resp.StatusCode
	apiResponse.Success = resp.StatusCode >= 200 && resp.StatusCode < 300 

	return apiResponse
}

func listenForJobs(rdb *redis.Client, wg *sync.WaitGroup) {
	defer wg.Done()

	for {
		jobStr, err := rdb.RPop(ctx, "api_jobs").Result()
		if err == redis.Nil {
			time.Sleep(1 * time.Second)
			continue
		} else if err != nil {
			log.Println("Error fetching job:", err)
			continue
		}

		var job ApiJob
		json.Unmarshal([]byte(jobStr), &job)

		fmt.Printf("Processing API request: %s\n", job.URL)
		processedJob := processAPI(job)

		// Publish results to Redis for NestJS to handle
		jobResult, _ := json.Marshal(processedJob)
		rdb.Publish(ctx, "api_results", jobResult)

		fmt.Println("Processed API:", processedJob.ApiID, "Status:", processedJob.StatusCode)
	}
}

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	fmt.Println("🚀 Golang worker started, listening for jobs...")

	var wg sync.WaitGroup
	numWorkers := 5 // Adjust based on system capacity

	// Start multiple workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go listenForJobs(rdb, &wg)
	}

	wg.Wait()
}

