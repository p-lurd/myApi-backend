package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"exmaple.com/go-routine/db"
	"exmaple.com/go-routine/cron"
	// "api-monitor-worker/db"
	
)





func main() {
	fmt.Println("🚀 Golang worker started, fetching and processing API jobs...")

	// Connect and disconnect MongoDB connection
	client := db.ConnectDB()
	defer db.DisconnectDB()

	cron.CronJob(client)
	


	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	fmt.Println("\n🛑 Shutting down...")
}

