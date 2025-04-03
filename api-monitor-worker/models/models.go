package models

import (
	"time"

	// "go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// API Job Model
// type ApiJob struct {
//     ID         primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
//     URL        string             `json:"url"`
//     BusinessID primitive.ObjectID `json:"businessId" bson:"businessId"`
//     Options    any                `json:"options,omitempty" bson:"options,omitempty"`
//     CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
//     UpdatedAt  time.Time          `json:"updatedAt" bson:"updatedAt"`
// }
type ApiJob struct {
    ID         bson.ObjectID `json:"id" bson:"_id,omitempty"`
    URL        string             `json:"url" bson:"url"`
    BusinessID bson.ObjectID             `json:"businessId" bson:"businessId"`
    Options    any                `json:"options,omitempty" bson:"options,omitempty"`
    CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt  time.Time          `json:"updatedAt" bson:"updatedAt"`
    Version    int                `json:"__v,omitempty" bson:"__v,omitempty"`
}

// API Response Model
type ApiResponse struct {
    URL          string             `json:"url"`
    ApiID        bson.ObjectID `json:"apiId" bson:"apiId"`
    StatusCode   int                `json:"statusCode"`
    ResponseTime int64              `json:"responseTime"`
    Success      bool               `json:"success"`
    BusinessID   bson.ObjectID `json:"businessId" bson:"businessId"`
    CreatedAt    time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt    time.Time          `json:"updatedAt" bson:"updatedAt"`
}

