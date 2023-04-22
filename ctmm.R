rm(list = ls())

library(move)
library(tidyverse)
library(mapdeck)
library(lubridate)
library(amt)
library(adehabitatHR)
library(sp)
library(dplyr)
library(geosphere)
library(ctmm)

#Login to Movebank
login <- movebankLogin(username="dwrgis", password="tracker1")
ge <-getMovebankData(study="American White Pelican, UDWR", login=login, removeDuplicatedTimestamps=T)
data<- as.data.frame(ge)

data <- read.csv("~/Downloads/pronghorn.csv")

#Create spatial filter bounds

data <- data %>%
  filter(location_lat >= -90) %>%
  filter(location_long >= -180) %>%
  
  filter(n() > 1) # Need more than 1 point

#Remove Duplicates
data <- data[!duplicated(data), ]


# make sure "t" is a POSIXct variable
data$date <- as.POSIXct(strptime(data$timestamp , format="%Y-%m-%d %H:%M:%S.%OS"), tz ="MST")
data$begindate <- as.POSIXct(strptime(data$timestamp_start , format="%Y-%m-%d %H:%M:%S.%OS"), tz ="MST")
data$enddate <- as.POSIXct(strptime(data$timestamp_end , format="%Y-%m-%d %H:%M:%S.%OS"), tz ="MST")

#Waylon <- subset(data, data$local_identifier == "Theodore" )


final_list <- list()

#Loop through individuals and create trajecotry list

for (id in unique(data$local_identifier)) {
  # Extract data for the current local_identifier
  current_data <- data[data$local_identifier == id, ]
  
  # Convert data to telemetry format and add additional fields
  current_track <- as.telemetry(current_data, id = "local_identifier")
  current_track$individual_name <- paste0("Individual ", id)
  current_track$lat <- current_data$location_lat
  
  # Remove lat and lon columns before applying outlie function
 # current_track_lat_lon <- current_track[c("lat", "lon")]
  current_track_lat_lon<- current_track$lat 

  # Apply outlie function to current track which caluclates distances, etc. 
  current_track <- outlie(current_track)
  
  # Add back lat and lon columns to current track
  current_track <- cbind(current_track_lat_lon, current_track)
  
  print(median(current_track$speed))
  # Append the current track to the final list
  final_list[[id]] <- current_track
}

threshold <- 15

#Remove outliers
BAD <- outliers$speed > 20
outliers$visible <- ifelse(outliers$speed >= 20, "false", outliers$visible)

data <- track[!BAD,]


for (i in seq_along(final_list)) {
  current_data <- data[data$local_identifier == id, ]
  
  # Get the data frame inside the current element of the list
  current_data <- final_list[[i]]
  
  # Check if the speed value is above the threshold
  current_data$visible <- ifelse(current_data$speed => 20, FALSE, TRUE)
  
  # Update the data frame inside the list
  final_list[[i]] <- current_data
}

true_indices <- which(final_list$visible == TRUE)



for (i in unique(data$local_identifier)) {
  # Extract data for the current local_identifier
  current_data <- data[data$local_identifier == i, ]
  
  # Convert data to telemetry format and add additional fields
  current_track <- as.telemetry(current_data, id = "local_identifier")
  
  current_track$individual_name <- paste0("Individual ", i)
  current_track$lat <- paste0("location_lat ", i)
  
  current_track <- outlie(current_track)
  
  
  # Append the current track to the telemetry list
  telemetry_list[[i]] <- current_track
}


track<- as.telemetry(data,id = "local_identifier") #needs to be a normal dataframe

outliers <- outlie(track)
plot(outliers)

hist(outliers$speed)

#Convert to dataframe
library(data.table)
df <- rbindlist(final_list)


