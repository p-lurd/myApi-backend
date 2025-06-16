package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"net/http"
	"log"

	"weup.com/go-routine/cron"
	"weup.com/go-routine/db"
	// "api-monitor-worker/db"
)

func main() {
	fmt.Println("🚀 Golang worker started, fetching and processing API jobs...")
	client := db.ConnectDB()
	defer db.DisconnectDB()

	cron.CronJob(client)
	
	http.HandleFunc("/", healthCheck)


	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
	// Connect and disconnect MongoDB connection
	

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	fmt.Println("\n🛑 Shutting down...")
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Service is healthy")
}