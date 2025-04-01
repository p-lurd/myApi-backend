package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"exmaple.com/go-routine/db"

	// "api-monitor-worker/db"
	"exmaple.com/go-routine/fetchjobs"
	"exmaple.com/go-routine/processjobs"
)





func main() {
	fmt.Println("🚀 Golang worker started, fetching and processing API jobs...")

	// Connect and disconnect MongoDB connection
	client := db.ConnectDB()
	defer db.DisconnectDB()

	// Fetch API jobs
	jobs := fetchjobs.FetchJobs(client)

	// Process jobs concurrently
	processjobs.ProcessJobsConcurrently(jobs, client)


	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	fmt.Println("\n🛑 Shutting down...")
}

