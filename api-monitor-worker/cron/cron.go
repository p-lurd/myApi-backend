package cron

import (
	"fmt"
	"time"

	"github.com/robfig/cron/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"weup.com/go-routine/fetchjobs"
	"weup.com/go-routine/processjobs"
)

func CronJob(client *mongo.Client) {
	// Create a new cron scheduler
	c := cron.New()

	// Schedule a job (Runs every 5 minute)
	_, err := c.AddFunc("*/5 * * * *", func() {
		// Fetch API jobs
		jobs := fetchjobs.FetchJobs(client)

		// Process jobs concurrently
		processjobs.ProcessJobsConcurrently(jobs, client)
		fmt.Println("✅ Cron Job Executed at:", time.Now().Format(time.RFC1123))
	})

	if err != nil {
		fmt.Println("❌ Error scheduling cron job:", err)
		return
	}

	// Start the scheduler in a separate goroutine
	c.Start()
	fmt.Println("🚀 Cron Job Scheduler Started")

	// Keep the program running
	select {} // Blocks forever
}
