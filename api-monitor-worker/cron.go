package main

import (
	"fmt"
	"time"

	"github.com/robfig/cron/v3"
)

func CronJob() {
	// Create a new cron scheduler
	c := cron.New()

	// Schedule a job (Runs every minute)
	_, err := c.AddFunc("*/5 * * * *", func() {
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
