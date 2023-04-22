'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/mapbox/light-v10',
  accessToken:
    'pk.eyJ1IjoianNoYXBpcm8xIiwiYSI6ImNrdDA1OGR5MzAxeHIyb290am05MzF1c2IifQ.wuOxNF5KFK0pjUJ3O80OmA',
  CSV: 'Data.csv',
  center: [-107.064494, 43.321768],
  zoom: 6,
  title: 'Merkle Research Group Publications',
  description:
    'This map displays publications submitted by researchers in the Merkle Group at the University of Wyoming. The coordinates are estimated or generalized and were dervied based on the location mentioned in the publication.',
  sideBarInfo: ['Project', 'Location','Species','URL','Year','Publication','Abstract','Path'],
  popupInfo: ['Project'],
  filters: [
    {
      type: 'dropdown',
      title: 'Publication Type: ',
      columnHeader: 'Publication Type',
      listItems: [
        'Research Paper',
        'Review Paper',
        'Technical Report'
      ],
    },
    {
      type: 'dropdown',
      title: 'Publication: ',
      columnHeader: 'Publication',
      listItems: [
        'Animal Conservation',
        'Canadian Journal of Zoology',
        'Conservation Letters',
        'Current Biology',
        'Ecological Applications',
        'Ecology Letters',
        'Ecosphere',
        'Enviornmental Management',
        'Frontiers in Ecology and Evolution',
        'Golabl Change Biology',
        'Journal of Animal Ecology',
        'Journal of Applied Ecology',
        'Journal of Wildlife Management',
        'Landscape Ecology',
        'Methods in Ecology and Evolution',
        'Oikos',
        'PloS',
        'Porceedings of Natural Academy of Science',
        'Proceedings of the Royal Society',
        'Remote Sensing',
        'Science',
        'Trends in Ecology & Evolution',
        'U.S. Geological Survey Scientific Investigations'
      ],
    },
    /*{
      type: 'checkbox',
      title: 'Species: ',
      columnHeader: 'Species', // Case sensitive - must match spreadsheet entry
      
      listItems: ['Mule Deer', 'Elk', 'Pronghorn','Bison','Black Bear'], // Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
    }, */
  ],
};
