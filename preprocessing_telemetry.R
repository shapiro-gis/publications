
rm(list = ls())

library(move)
library(tidyverse)
library(mapdeck)
library(highcharter)
library(lubridate)
library(scales)
library(amt)
library(adehabitatHR)
library(sp)
library(sf)
library(dplyr)
library(geosphere)
library(swaRm)
library(ctmm)


#Login to Movebank
login <- movebankLogin(username="dwrgis", password="tracker1")
ge <-getMovebankData(study="American White Pelican, UDWR", login=login, removeDuplicatedTimestamps=T)

ge.df <- as.data.frame(ge)
data<- ge.df

data <- read.csv("~/Downloads/pronghorn.csv")


#Convert to spatial points dataframe
coordinates(data) <- ~ location.long + location.lat
proj4string(data) =  "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs +ellps=GRS80 " #+towgs84=0,0,0"
proj4string(data) <- CRS("+proj=utm +zone=12 +ellps=WGS84")
proj4string(data)<- "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs +ellps=GRS80 " #+towgs84=0,0,0"

#Create spatial filter bounds

data <- data %>%
  filter(location.lat >= -90) %>%
  filter(location.long >= -180) %>%
  
  filter(n() > 1) # Need more than 1 point

#Remove Duplicates
data <- data[!duplicated(data), ]


# make sure "t" is a POSIXct variable
data$date <- as.POSIXct(strptime(data$timestamp , format="%Y-%m-%d %H:%M:%S.%OS"), tz ="MST")

library(geosphere)


# Create empty columns for new variables
data$distance <- NA
data$time_diff <- NA
data$speed <- NA
data$bearing <- NA
data$flag <- NA
data$turn_angle<- NA

data$id<- data$tag.local.identifier

# Loop through each unique id
for (id in unique(data$id)) {
  
  # Subset the data for the current id
  id_data <- data[data$id == "17373",]
  
  # Calculate distance, time difference, speed, and bearing for each point
  for (i in 2:nrow(id_data)) {
    dist <- distm(id_data[i-1, c("location.long", "location.lat")], id_data[i, c("location.long", "location.lat")], fun = distHaversine)
    time_diff <- as.numeric(difftime(id_data$date[i], id_data$date[i-1], units = "secs"))
    #time_diff <- diff(subset_data$date)
    
    speed <- dist / time_diff
    bearing <- bearing(id_data[i-1, c("location.long", "location.lat")], id_data[i, c("location.long", "location.lat")])
   # bearing_diff <- ((bearing - id_data$bearing[i-1]) + 180) %% 360 - 180
    #turn_angle <- ifelse(i == 2, NA, bearing_diff - id_data$turn_angle[i-1])
    
    #remove speed > S and 0 > A(sharp, high speed turns)
    #find 99 percentile
    speed_threshold<- quantile(id_data$speed, 0.99,na.rm = TRUE)
    dist_threshold<- quantile(id_data$distance, 0.99,na.rm = TRUE)
    time_threshold<- quantile(id_data$time_diff, 0.99,na.rm = TRUE)
    
    #id_data$flag <- ifelse(id_data$speed >= threshold, TRUE, FALSE)
    id_data$flag <- ifelse(id_data$distance > dist_threshold & id_data$time_diff >= time_threshold & id_data$speed > speed_threshold, TRUE, FALSE)
    
    
    # Assign the calculated values to the corresponding columns in the original dataframe
    data$distance[data$tag.local.identifier == id][i] <- dist
    data$time_diff[data$tag.local.identifier == id][i] <- time_diff
    data$speed[data$tag.local.identifier == id][i] <- speed
    data$bearing[data$tag.local.identifier == id][i] <- bearing
    data$flag[data$tag.local.identifier == id][i] <- id_data$flag
    data$turn_angle[data$tag.local.identifier == id][i] <- turn_angle

    
  }
  print(id)
  leaflet(data = id_data) %>% 
    addProviderTiles(providers$CartoDB.Positron) %>%
    addCircles(~location.long, ~location.lat, col = ifelse(id_data$flag == FALSE, "purple","black"), opacity = 0.9) %>%
    addMiniMap()
}

leaflet(data = id_data) %>% 
  addProviderTiles(providers$CartoDB.Positron) %>%
  addCircles(~location.long, ~location.lat, 
             col = "black", opacity = 0.9) %>%
  addMiniMap()

#4.1Missing observations


#Filter on unreliable positions
#estimate straight-line speeds between sampled times and distances from the bulk of the data.
# Define outlier detection function
detect_outliers <- function(df, distance_thresh, time_thresh) {
  # Calculate z-scores for distance and time intervals
  distance_zscore <- abs(scale(df$dist))
  time_zscore <- abs(scale(df$dt))
  
  # Identify outliers based on z-score thresholds
  outliers <- which(distance_zscore > distance_thresh |
                      time_zscore > time_thresh)
  
  # Return outliers as a vector of indices
  return(outliers)
}

# Set outlier detection thresholds
distance_thresh <- 2.5
time_thresh <- 2.5

# Detect outliers
outliers <- detect_outliers(df, distance_thresh, time_thresh)

##Remove large location errors

#Filter unrealistic movements or "spike" points that artifically high speeds betwepoints
# us a data-driven threshold like 95th percentile of speeds from the track


#Calculate turn angles
library(bayesmove)

tracks<- prep_data(dat = data, coord.names = c("location.long","location.lat"), id = "tag.local.identifier")

turn_angles <- c(NA, diff(bearings))

turn_angles[turn_angles > 180] <- turn_angles[turn_angles > 180] - 360
turn_angles[turn_angles < -180] <- turn_angles[turn_angles < -180] + 360

# Add turn angle column to data
data$turn_angle <- turn_angles

#Combine speed with turning angles incase animals can actually move that spfast



#Create ltraj object
spdf <- as.ltraj(coordinates(data),date=data$date,id=data$tag.local.identifier, typeII=TRUE)

# #Loop through and add id name
for(i in 1:length(spdf)){
  current.id<- attr(spdf[[i]], "id")
  spdf[[i]]["id"] <- as.character(current.id)
}
ltraj<- do.call(rbind.data.frame, spdf)
ltraj$distance<- ltraj$dist * 0.621371
ltraj$distance <- ltraj$dist * 
  summary <- numSummary(dfdeer[,"dist"],groups=dfdeer$burst, statistics=c("mean","sd"))


#Find time gaps 

#flag records as visible is false
data$visible <- ifelse(data$diff >= 16, false, data$visible)



#Look at the data on a map

# Append WMU to animal

library(leaflet)

leaflet(data = id_data) %>% 
  addProviderTiles(providers$CartoDB.Positron) %>%
  addCircles(~location.long, ~location.lat, col = "purple", opacity = 0.9) %>%
  addMiniMap()



library(mapdeck)

#First need a token to access mapbox
set_token( "pk.eyJ1IjoiZHdyLWdpcyIsImEiOiJja2o5NGt6aXEyOXI3MnlwazVtNHdjcGRvIn0.PX-Eg-1b6XY52woh0NVTfw" )
mapdeck_tokens()

## Link to other customization options to map https://rdrr.io/cran/mapdeck/man/add_scatterplot.html

mapdeck(style = 'mapbox://styles/mapbox/outdoors-v11')  %>% #Here is a link to other mapbox styles: https://docs.mapbox.com/api/maps/styles/
  add_scatterplot(
    data = data,
    lat = "location.lat",
    lon = "location.long",
    radius = 10,
    stroke_width = 1
  )  

