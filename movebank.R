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


rm(list = ls())

#Login to Movebank
login <- movebankLogin(username="dwrgis", password="tracker1")
ge <-getMovebankData(study="American White Pelican, UDWR", login=login, removeDuplicatedTimestamps=T)

data <- read.csv("~/Downloads/pronghorn.csv")

#Create dataframe
ge.df <- as.data.frame(ge)
data<- ge.df

#Convert to spatial points dataframe
coordinates(ge.df) <- ~ location_long + location_lat
proj4string(ge.df) = "+proj=longlat +ellps=WGS84 +no_defs"

#convert to UTM for move packages
my.crs <- "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs +ellps=GRS80 " #+towgs84=0,0,0"
#old my.crs <-  "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs +ellps=GRS80 +towgs84=0,0,0"
mydat <- spTransform(df_sp, my.crs)


#Create simple point 
sf_point <- st_as_sf(data, coords = c("location.long", "location.lat"), crs = st_crs("+proj=longlat +datum=WGS84"))


#Remove Duplicates
data <- data[!duplicated(data), ]


# make sure "t" is a POSIXct variable
data$date <- as.POSIXct(data$timestamp)
data$date <- as.POSIXct(strptime(data$timestamp , format="%Y-%m-%d %H:%M:%S.%OS"), tz ="MST")

#Calculate time difference
data$diff<- unlist(tapply(data$date, INDEX = data$tag.local.identifier,
                          FUN = function(x) c(0, `units<-`(diff(x), "hours"))))

data$diff<- round(data$diff)

# vector of AnimalIDs
animal.ids <- unique(data$tag_id)

#Create spatial filter bounds

data <- data %>%
  filter(location.lat >= -90) %>%
  filter(location.long >= -180) %>%
  
  filter(n() > 1) # Need more than 1 point


#Filter on unreliable positions

##Remove large location errors

#Filter unrealistic movements or "spike" points that artifically high speeds betwepoints
# us a data-driven threshold like 95th percentile of speeds from the track

####Calculate distance

data$Latitude <- as.numeric(data$location.lat)
data$Longitude <- as.numeric(data$location.long)


# Group by id and create column with previous point

data <- data %>%
  group_by(tag.local.identifier) %>%
  mutate(prev_longitude = lag(location.long),
         prev_latitude = lag(location.lat))

# get next point for each ID

data <- data %>%
  group_by(tag.local.identifier) %>%
  mutate(next_lon = lead(location.long),
         next_lat = lead(location.lat)) # replace "Longitude" and "Latitude" with your actual coordinate column names


# distHaversine 

df_distance <- df_lag %>%
  group_by(tag.local.identifier) %>%
  distance = distHaversine(cbind(df_lag$prev_latitude, df_lag$prev_longitude),
                           cbind(location.lat, location.long))

df <- data %>%
  mutate(distance = distm(cbind(location.long, location.lat),
                          cbind(next_lon, next_lat),
                          fun = distHaversine)) # replace "Longitude", "Latitude", "next_lon", and "next_lat" with your actual column names


dt.haversine <- function(lat_from, lon_from, lat_to, lon_to, r = 6378137){
  radians <- pi/180
  lat_to <- lat_to * radians
  lat_from <- lat_from * radians
  lon_to <- lon_to * radians
  lon_from <- lon_from * radians
  dLat <- (lat_to - lat_from)
  dLon <- (lon_to - lon_from)
  a <- (sin(dLat/2)^2) + (cos(lat_from) * cos(lat_to)) * (sin(dLon/2)^2)
  return(2 * atan2(sqrt(a), sqrt(1 - a)) * r)
}

##returns in meters
data <- data %>%
  group_by(tag.local.identifier) %>%
  mutate(distance = dt.haversine(prev_latitude, prev_longitude, location.lat, location.long)) 

#returns distance in miles
data$distance = data$distance * 0.000621371


#Remove NA values
data<- na.omit(data)

# Calculate speed in meters per hour based on previous location

data$speed <- data %>%
  group_by(tag.local.identifier) %>%
  mutate(speed = round((distance * 0.621371192) / diff, 2))

# Calculate bearing

bearings <- bearing(data[c(1:nrow(data)-1), c("prev_longitude", "prev_latitude")], 
                    data[c(2:nrow(data)), c("location.long", "location.lat")])


#Calculate turn angles
library(bayesmove)

tracks<- prep_data(dat = data, coord.names = c("location.long","location.lat"), id = "tag.local.identifier")

turn_angles <- c(NA, diff(bearings))

turn_angles[turn_angles > 180] <- turn_angles[turn_angles > 180] - 360
turn_angles[turn_angles < -180] <- turn_angles[turn_angles < -180] + 360

# Add turn angle column to data
data$turn_angle <- turn_angles

#Combine speed with turning angles incase animals can actually move that spfast
#remove speed > S and 0 > A(sharp, high speed turns)


#Find time gaps 

#flag records as visible is false
data$visible <- ifelse(data$diff >= 16, false, data$visible)



#Look at the data on a map

# Append WMU to animal

library(leaflet)

leaflet(data = ge.df) %>% 
  addProviderTiles(providers$CartoDB.Positron) %>%
  addCircles(~location_long, ~location_lat, col = "purple", opacity = 0.9) %>%
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

