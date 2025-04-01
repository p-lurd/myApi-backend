package models

// API Job Model
type ApiJob struct {
	ID         string `json:"id" bson:"_id"`
	URL        string `json:"url"`
	BusinessID string `json:"businessId"`
	Options    any    `json:"options,omitempty"`
}

// API Response Model
type ApiResponse struct {
	URL          string `json:"url"`
	ApiID        string `json:"apiId"`
	StatusCode   int    `json:"statusCode"`
	ResponseTime int64  `json:"responseTime"`
	Success      bool   `json:"success"`
	BusinessID   string `json:"businessId"`
}
