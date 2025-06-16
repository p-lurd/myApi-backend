package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"weup.com/go-routine/cron"
	"weup.com/go-routine/db"
)

func main() {
	fmt.Println("🚀 Golang worker started, fetching and processing API jobs...")

	// Connecting to MongoDB first
	client := db.ConnectDB()
	defer db.DisconnectDB()

	// Setting up HTTP server first
	http.HandleFunc("/", healthCheck)
	http.HandleFunc("/health", healthCheck)
	http.HandleFunc("/run-cron", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received cron trigger via HTTP")
		cron.CronJob(client)
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Cron job executed")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Creating HTTP server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      nil,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Starting server in a goroutine (non-blocking)
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Server error: %v", err)
		}
	}()

	// Start the cron job (this will run in the main goroutine)
	// go cron.CronJob(client)

	// graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// for interrupt signal
	<-stop
	fmt.Println("\n🛑 Shutting down gracefully...")

	// context with timeout for graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown the server
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	fmt.Println("✅ Server stopped")
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status": "healthy", "timestamp": "%s"}`, time.Now().Format(time.RFC3339))
}
