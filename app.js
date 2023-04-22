/* global config csv2geojson turf Assembly $ */
'use strict';

mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo; //Read in the columns you want for the sidebar

let geojsonData = {};
const filteredGeojson = {
  type: 'FeatureCollection',
  features: [],
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jshapiro1/clgmnmh0h001h01rn0f1i0wzt', //config.style,
  center: config.center,
  zoom: config.zoom,
  transformRequest: transformRequest,
});




function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature,
    zoom: 11,
  });
}

function createPopup(currentFeature) {
  const popups = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popups[0]) popups[0].remove();
  new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML('<h3>' + currentFeature.properties[config.popupInfo] + '</h3>')
    //.setHTML(`<button class="btn">todo</button>`)
    .addTo(map);
}

function buildLocationList(locationData) {
  /* Add a new listing section to the sidebar. */
  const listings = document.getElementById('listings');

  listings.innerHTML = '';

  locationData.features.forEach((location, i) => {
    const prop = location.properties;

    const listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = 'listing-' + prop.id;
    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    // Create a container for the image and link
    const container = listing.appendChild(document.createElement('div'));
    container.className = 'item-container';

    // Set the container display property to flex
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginTop = '12px';
    container.style.marginBottom = '10px';

    /* Add the link to the individual listing created above. */
    const link = container.appendChild(document.createElement('button'));
    link.className = 'title';
    link.id = 'link-' + prop.id;
    link.style.fontSize = "16px"; //Change font size of title
    link.style.alignSelf = "flex-start"; // Align the title with the top of the container
    link.innerHTML = '<p style="line-height: 1.25; margin: 0">' + prop[columnHeaders[0]] + '</p>';

    // Create an img element for the icon and add it to the container
    const img = container.appendChild(document.createElement('img'));
    img.src = prop[columnHeaders[7]];
    img.className = 'item-image';
    img.style.width = '100px';
    img.style.height = '130px';
    img.style.marginLeft = '10px';
    //img.style.float = 'left';
    img.style.padding = '3px';


    /* Add details to the individual listing. */
    const details = listing.appendChild(document.createElement('div'));
    details.className = 'content';
    //details.style.marginTop = '-10%';
    //details.style.clear = 'both'; // Add this line to clear the float
   

   for (let i = 1; i < columnHeaders.length; i++) {
    const div = document.createElement('div');
    const header = document.createElement('span');
    header.style.fontWeight = 'bold';
    header.style.fontSize = '13px';
    header.style.color = '#74645b';
   
    header.innerText = `${columnHeaders[i]}: `;
    
    if (i === 3) {
      const link = prop[columnHeaders[i]];
      if (link) {
        const value = document.createElement('a');
        value.href = link;
        value.target = '_blank';
        value.style.fontSize = '12px';
        value.innerText = prop[columnHeaders[i]];
        div.appendChild(header);
        div.appendChild(value);
      } else {
        const value = document.createElement('span');
        value.innerText = prop[columnHeaders[i]];
        value.style.fontSize = '12px';
        div.appendChild(header);
        div.appendChild(value);
      }
    } else {
      const value = document.createElement('span');
      value.style.fontSize = '12px';
      value.innerText = prop[columnHeaders[i]];
      div.appendChild(header);
      div.appendChild(value);
    }
  
    details.appendChild(div);
  }

      
    link.addEventListener('click', function () {
      const clickedListing = location.geometry.coordinates;
      flyToLocation(clickedListing);
      createPopup(location);

      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

      const divList = document.querySelectorAll('.content');
      const divCount = divList.length;
      for (i = 0; i < divCount; i++) {
        divList[i].style.maxHeight = null;
      }

      for (let i = 0; i < geojsonData.features.length; i++) {
        this.parentNode.classList.remove('active');
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });
}

// Build dropdown list function
// title - the name or 'category' of the selection e.g. 'Languages: '
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('h3');
  filterTitle.innerText = title;
  filterTitle.classList.add('py12', 'txt-bold');
  mainDiv.appendChild(filterTitle);

  const selectContainer = document.createElement('div');
  selectContainer.classList.add('select-container', 'center');

  const dropDown = document.createElement('select');
  dropDown.classList.add('select', 'filter-option');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');

  dropDown.appendChild(firstOption);
  selectContainer.appendChild(dropDown);
  selectContainer.appendChild(selectArrow);
  mainDiv.appendChild(selectContainer);

  for (let i = 0; i < listItems.length; i++) {
    const opt = listItems[i];
    const el1 = document.createElement('option');
    el1.textContent = opt;
    el1.value = opt;
    dropDown.appendChild(el1);
  }
  filtersDiv.appendChild(mainDiv);
}
//// Testing
const animals = [
  { name: "Elk", icon: "elk.png" },
  { name: "Mule Deer", icon: "MuleDeer.png" },
  { name: "Bison", icon: "Bison.png" },
  { name: "Moose", icon: "Moose.png" },
  { name: "Black Bear", icon: "blackbear.png" },
  { name: "Pronghorn", icon: "pronghorn.png" }


];

const container = document.getElementById("animal-icons-container");
let selectedAnimal = null;

for (let i = 0; i < animals.length; i++) {
  const animal = animals[i];
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("icon-container");
  iconContainer.style.display = "flex";
  iconContainer.style.flexDirection = "column";
  iconContainer.style.alignItems = "center";
  const icon = document.createElement("img");
  
  icon.src = animal.icon;
  icon.alt = animal.name;
  icon.style.maxHeight = "40"; // set a maximum height for the icon image
  icon.style.maxWidth = "40"; // set a maximum width for the icon image
  const name = document.createElement("span");
  name.innerText = animal.name;
  name.style.textAlign = "center";
  name.style.fontSize = "13px"; // set the font size of the label to 16px

  iconContainer.appendChild(icon);
  iconContainer.appendChild(name);
  container.appendChild(iconContainer);
  

  iconContainer.addEventListener('click', (function(animal) {
    return function() {
      if (selectedAnimal === animal) {
        selectedAnimal = null;
        unhighlightIcon(iconContainer);
        filterGeojson(null);
      } else if (selectedAnimal === null) {
        selectedAnimal = animal.name;
        highlightIcon(iconContainer);
        filterGeojson(selectedAnimal);
      } else {
        const prevIconContainer = document.querySelector(`[alt="${selectedAnimal}"]`).parentNode;
        unhighlightIcon(prevIconContainer);
        if (selectedAnimal !== animal.name) {
          selectedAnimal = animal.name;
          highlightIcon(iconContainer);
          filterGeojson(selectedAnimal);
        } else {
          selectedAnimal = null;
          filterGeojson(null);
        }
      }
    }
  })(animal));
}


function filterGeojson(animal) {
  console.log("selected animal:", animal);
  // Replace with your actual geojson data
  //geojsonData.features.forEach((feature) => {

  const geojson = map.getSource('locationData')._data;

  const filteredFeatures = geojsonData.features.filter(feature => {
    // Replace 'Species' with the property in your geojson data that corresponds to the animal name
    const animalName = feature.properties.Species;

    if (animal === null ) {
      return true; // include all features if no animal is selected
    }
    
    return animalName.toLowerCase().includes(animal.toLowerCase());

  });

  console.log("filtered features:", filteredFeatures);

  const filteredGeojson = {
    "type": "FeatureCollection",
    "features": filteredFeatures
  };
  console.log("filtered geojson:", filteredGeojson);

  // Do something with the filtered geojson, e.g. update a map layer
  console.log("map source before update:", map.getSource('locationData')._data);
  map.getSource('locationData').setData(filteredGeojson);
  console.log("map source after update:", map.getSource('locationData')._data);
  buildLocationList(filteredGeojson);
  return filteredGeojson;

}


function highlightIcon(container) {
  container.classList.add("selected");
}

function unhighlightIcon(container) {
  container.classList.remove("selected");
}

function unhighlightIcons() {
  const iconContainers = document.querySelectorAll('.icon-container');
  iconContainers.forEach(container => {
    const iconLabel = container.querySelector('span').innerText.toLowerCase();
    if (selectedAnimal === null || iconLabel !== selectedAnimal.toLowerCase()) {
      unhighlightIcon(container);
    } else {
      highlightIcon(container);
    }
  });
}





// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items
// To DO: Clean up code - for every third checkbox, create a div and append new checkboxes to it

function buildCheckbox(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  const formatcontainer = document.createElement('div');
  filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
  formatcontainer.classList.add(
    'center',
    'flex-parent',
    'flex-parent--column',
    'px3',
    'flex-parent--space-between-main',
  );
  const secondLine = document.createElement('div');
  secondLine.classList.add(
    'center',
    'flex-parent',
    'py12',
    'px3',
    'flex-parent--space-between-main',
  );
  filterTitle.innerText = title;
  mainDiv.appendChild(filterTitle);
  mainDiv.appendChild(formatcontainer);

  for (let i = 0; i < listItems.length; i++) {
    const container = document.createElement('label');

    container.classList.add('checkbox-container');

    const input = document.createElement('input');
    input.classList.add('px12', 'filter-option');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', listItems[i]);
    input.setAttribute('value', listItems[i]);

    const checkboxDiv = document.createElement('div');
    const inputValue = document.createElement('p');
    inputValue.innerText = listItems[i];
    checkboxDiv.classList.add('checkbox', 'mr6');
    checkboxDiv.appendChild(Assembly.createIcon('check'));

    container.appendChild(input);
    container.appendChild(checkboxDiv);
    container.appendChild(inputValue);

    formatcontainer.appendChild(container);
  }
  filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];


function createFilterObject(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      checkboxFilters.push(keyValues);
    }
    console.log(checkboxFilters)
    if (filter.type === 'dropdown') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      selectFilters.push(keyValues);
    }
  });
}


function applyFilters() {
  const filterForm = document.getElementById('filters');

  

  filterForm.addEventListener('change', function () {
    const filterOptionHTML = this.getElementsByClassName('filter-option');
    const filterOption = [].slice.call(filterOptionHTML);

    const geojSelectFilters = [];
    const geojCheckboxFilters = [];

    // const filteredFeatures = [];
    // filteredGeojson.features = [];


    filterOption.forEach((filter) => {
      if (filter.type === 'checkbox' && filter.checked) {
        checkboxFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojCheckboxFilters.push(geojFilter);
            }
          });
        });
      }
      if (filter.type === 'select-one' && filter.value) {
        selectFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojSelectFilters.push(geojFilter);
            }
          });
        });
      }
    });

    if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
      geojsonData.features.forEach((feature) => {
        filteredGeojson.features.push(feature);
      });
    } else if (geojCheckboxFilters.length > 0) {
      geojCheckboxFilters.forEach((filter) => {
        geojsonData.features.forEach((feature) => {
          if (feature.properties[filter[0]].includes(filter[1])) {
            if (
              filteredGeojson.features.filter(
                (f) => f.properties.id === feature.properties.id,
              ).length === 0
            ) {
              filteredGeojson.features.push(feature);
            }
          }
        });
      });
      if (geojSelectFilters.length > 0) {
        const removeIds = [];
        filteredGeojson.features.forEach((feature) => {
          let selected = true;
          geojSelectFilters.forEach((filter) => {
            if (
              feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
              selected === true
            ) {
              selected = false;
              removeIds.push(feature.properties.id);
            } else if (selected === false) {
              removeIds.push(feature.properties.id);
            }
          });
        });
        let uniqueRemoveIds = [...new Set(removeIds)];
        uniqueRemoveIds.forEach(function (id) {
          const idx = filteredGeojson.features.findIndex(
            (f) => f.properties.id === id,
          );
          filteredGeojson.features.splice(idx, 1);
        });
      }
    } else {
      geojsonData.features.forEach((feature) => {
        let selected = true;
        geojSelectFilters.forEach((filter) => {
          if (
            !feature.properties[filter[0]].includes(filter[1]) &&
            selected === true
          ) {
            selected = false;
          }
        });
        if (
          selected === true &&
          filteredGeojson.features.filter(
            (f) => f.properties.id === feature.properties.id,
          ).length === 0
        ) {
          filteredGeojson.features.push(feature);
        }
      });
    }

    map.getSource('locationData').setData(filteredGeojson);
    buildLocationList(filteredGeojson);
  });
}

function filters(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      buildCheckbox(filter.title, filter.listItems);
    } else if (filter.type === 'dropdown') {
      buildDropDownList(filter.title, filter.listItems);
    }
  });
}

function removeFilters() {
  const input = document.getElementsByTagName('input');
  const select = document.getElementsByTagName('select');
  const selectOption = [].slice.call(select);
  const checkboxOption = [].slice.call(input);
  filteredGeojson.features = [];

  // Get the previously selected icon
  const prevSelectedIcon = document.querySelector('.selected-icon');

  checkboxOption.forEach((checkbox) => {
    if (checkbox.type === 'checkbox' && checkbox.checked === true) {
      checkbox.checked = false;
    }
  });

  selectOption.forEach((option) => {
    option.selectedIndex = 0;
  });

  map.getSource('locationData').setData(geojsonData);
  buildLocationList(geojsonData);

  // Unhighlight the previously selected icon
  if (prevSelectedIcon) {
    prevSelectedIcon.classList.remove('selected-icon');
  }

  // Reset the selected animal
  selectedAnimal = null;
  unhighlightIcons(selectedAnimal)
}





function removeFiltersButton() {
  const removeFilter = document.getElementById('removeFilters');
  removeFilter.addEventListener('click', () => {
    removeFilters();
  });
}

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: true, // Use the geocoder's default marker style
  styel: 'mapbox://styles/jshapiro1/clgmnmh0h001h01rn0f1i0wzt', 
  zoom: 11,
});

function sortByDistance(selectedPoint) {
  const options = { units: 'miles' };
  let data;
  if (filteredGeojson.features.length > 0) {
    data = filteredGeojson;
  } else {
    data = geojsonData;
  }
  data.features.forEach((data) => {
    Object.defineProperty(data.properties, 'distance', {
      value: turf.distance(selectedPoint, data.geometry, options),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  data.features.sort((a, b) => {
    if (a.properties.distance > b.properties.distance) {
      return 1;
    }
    if (a.properties.distance < b.properties.distance) {
      return -1;
    }
    return 0; // a must be equal to b
  });
  const listings = document.getElementById('listings');
  while (listings.firstChild) {
    listings.removeChild(listings.firstChild);
  }
  buildLocationList(data);
}

geocoder.on('result', (ev) => {
  const searchResult = ev.result.geometry;
  sortByDistance(searchResult);
});

map.on('load', () => {
  map.addControl(geocoder, 'top-right');

  map.addSource('maine', {
    'type': 'geojson',
    'data': {
    'type': 'Feature',
    'geometry': {
    'type': 'Polygon',
    // These coordinates outline Maine.
    'coordinates': [
    [
    [-67.13734, 45.13745],
    [-66.96466, 44.8097],
    [-68.03252, 44.3252],
    [-69.06, 43.98],
    [-70.11617, 43.68405],
    [-70.64573, 43.09008],
    [-70.75102, 43.08003],
    [-70.79761, 43.21973],
    [-70.98176, 43.36789],
    [-70.94416, 43.46633],
    [-71.08482, 45.30524],
    [-70.66002, 45.46022],
    [-70.30495, 45.91479],
    [-70.00014, 46.69317],
    [-69.23708, 47.44777],
    [-68.90478, 47.18479],
    [-68.2343, 47.35462],
    [-67.79035, 47.06624],
    [-67.79141, 45.70258],
    [-67.13734, 45.13745]
    ]
    ]
    }
    }
  });

  

  // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
  console.log('loaded');
  $(document).ready(() => {
    console.log('ready');
    $.ajax({
      type: 'GET',
      url: 'Data.csv',
      dataType: 'text',
      success: function (csvData) {
        makeGeoJSON(csvData);
      },
      error: function (request, status, error) {
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(
      csvData,
      {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ',',
      },
      (err, data) => {
        data.features.forEach((data, i) => {
          data.properties.id = i;
        });

        geojsonData = data;
        // Add the the layer to the map
        map.addLayer({
          id: 'locationData',
          type: 'circle',
          source: {
            type: 'geojson',
            cluster: true,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50,
            data: geojsonData,
          },
          paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#592202',
              100,
              '#592202',
              750,
              '#592202'
              ],
  
            
            'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
            ]
            },
            
        /*  paint: {
            'circle-radius': 5, // size of circles
            'circle-color': '#3D2E5D', // color of circles
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 0.7,
          }, */
        });
        
      
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "locationData",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Arial Unicode MS Bold"],
            "text-size": 12,
            "text-allow-overlap" : true
          },
          paint: {
            "text-color": "#ffffff"
          }
        });
      
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "locationData",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#402820",
            "circle-radius": 5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
          }
        });
      },
    );

    map.on('click', 'locationData', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['locationData'],
      });
      const clickedPoint = features[0].geometry.coordinates;
      flyToLocation(clickedPoint);
      sortByDistance(clickedPoint);
      createPopup(features[0]);
    });

    map.on('mouseenter', 'locationData', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'locationData', () => {
      map.getCanvas().style.cursor = '';
    });
    buildLocationList(geojsonData);
  }
});

// Modal - popup for filtering results
const filterResults = document.getElementById('filterResults');
const exitButton = document.getElementById('exitButton');
const modal = document.getElementById('modal');


filterResults.addEventListener('click', () => {
  modal.classList.remove('hide-visually');
  modal.classList.add('z5');
});



exitButton.addEventListener('click', () => {
  modal.classList.add('hide-visually');
});

const title = document.getElementById('title');
title.innerText = config.title;
const description = document.getElementById('description');
description.innerText = config.description;

function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=finder&') : url,
  };
}
