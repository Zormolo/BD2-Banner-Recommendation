const fs = require( 'fs' );
const path = require( 'path' );

const WANTED_SUBJECT_TITLES = [
  'notice of live update',
  'routine maintenance and update',
];

const ONE_DAY_IN_MS = 86400000;
const NEWS_LOOKBACK_DAYS = 30;
const LOOKBACK_DAYS_IN_MS = NEWS_LOOKBACK_DAYS * ONE_DAY_IN_MS;

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  PURPLE: '\x1b[35m',
  YELLOW: '\x1b[33m'
};

const DUPLICATED_COSTUME_NAMES = [
  'pool_party',
  'new_hire',
  'comeback_idol',
  'b-rank_idol',
  'apostle',
  'beach_vacation',
  'reclaimed_destiny_sacred'
];

const BANNER_JSON_BLANC = {
  "charName": "",
  "dmgAtt": "",
  "costumeName": "",
  "roles": [],
  "imgName": "",
  "startDate": "",
  "endDate": "",
  "breakpoints": [
    []
  ],
  "pullPriority": "",
  "pullReason": "",
  "pros": [],
  "cons": [],
  "modes": {
    "gr": "",
    "fh": "",
    "ln": "",
    "tos": "",
    "mw": "",
    "gc": "",
    "gen": ""
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function init() {
  const start = performance.now();
  const res = await fetch( 'https://webapi.browndust2.com/api/notices?locale=en-us&category=inspection' );
  const jsonData = await res.json();
  const inspections = jsonData.items;

  if ( !inspections ) {
    console.error( 'No data from API-Call' );
    return;
  }

  const inspectionFiltered = await filterInspection( inspections );

  const bannerInfoArray = extractBannerInfo( inspectionFiltered );
  cleanBannerStrings( bannerInfoArray );
  const bannerArray = buildBannerObjects( bannerInfoArray );

  console.log( makeStrColored( 'All Done!', COLORS.GREEN ) );

  addBannersToDataFile( bannerArray );

  const end = performance.now();
  console.log( Math.trunc( end - start ) + " ms to execute the code..." )
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function filterInspection( inspections ) {
  const contentUrls = [];

  for( const inspection of inspections ) {
    if ( !checkSubject( inspection.subject ) ) {
      continue;
    }
    if ( !checkRelevanceOfNews( inspection.publishedAt ) ) {
      break;
    }

    contentUrls.push( `https://webapi.browndust2.com/api/notices/${ inspection.id }?locale=en-us` );
  }

  const response = await Promise.all( contentUrls.map( url => fetch( url ) ) );
  return await Promise.all( response.map( res => res.json() ) );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkSubject( subject ) {
  subject = subject.toLowerCase();
  if ( subject.includes( 'routine maintenance and update complete' ) ) { //No banner info is in those news
    return false;
  }

  const isWantedSubject = WANTED_SUBJECT_TITLES.some( partOfTitle => subject.includes( partOfTitle ) );
  return isWantedSubject;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkRelevanceOfNews( newsPublishDateString ) {
  const newsPublishDateTime = new Date( newsPublishDateString ).getTime();
  const currentDateAsTime = new Date().getTime();

  return newsPublishDateTime >= currentDateAsTime - LOOKBACK_DAYS_IN_MS;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function extractBannerInfo( inspectionArray ) {
  const filter = /(laid-)?(b-)?[a-z]+[\w\s]*costume\s*:[\w\s,:]*(\(utc\))?\s*[-~]+[\w\s,:]+(\(utc\))?/gmi; //v2
  const bannerInfoArray = [];

  for( const inspection of inspectionArray ) {
    const filteredSections = filterSections( inspection.contentHtml, filter );
    const filteredSectionsWithPublishDate = filteredSections.map( section => {
      return {
        bannerString: section,
        publishDate: inspection.publishedAt
      }
    } );
    bannerInfoArray.push( ...filteredSectionsWithPublishDate );
  }
  // console.log( bannerInfoArray )
  return bannerInfoArray;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function filterSections( inspection, regexFilter ) {
  const bannerArray = [];
  const sectionParts = [];
  inspection.split( '<div>' ).forEach( chunk => {
    const parts = chunk.split( '<br>' );
    sectionParts.push( ...parts );
  } );

  for ( const sectionPart of sectionParts ) {
    const matchFounds = sectionPart.match( regexFilter );
    if ( matchFounds ) {
      bannerArray.push( ...matchFounds );
    }
  }

  return bannerArray;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cleanBannerStrings( bannerInfoArray ) {
  const removeList = [ 'Costume', 'costume', 'After', 'after', 'the', 'Maintenance', 'maintenance', 'Before', 'before', '(UTC)' ];

  for( let i = 0; i < bannerInfoArray.length; i++ ) {
    let bannerString = bannerInfoArray[ i ].bannerString;
    bannerString = bannerString.replace( ':', '@' );
    bannerString = bannerString.replace( '~', '-' );

    for( const removeString of removeList ) {
      bannerString = bannerString.replaceAll( removeString, '' );
    }
    bannerInfoArray[ i ].bannerString = bannerString.trim();
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function buildBannerObjects( bannerInfoArray ) {
  const bannerArray = [];

  for( const bannerInfo of bannerInfoArray ) {
    const [ costumeString, dateString ] = bannerInfo.bannerString.split( '@' ).map( s => s.trim() );
    const [ startDate, endDate ] = parseDateString( dateString, new Date( bannerInfo.publishDate ) );

    if ( new Date( endDate ).getTime() - new Date().getTime() < 0 ) {
      continue;
    }

    const bannerJSONStruct = JSON.parse( JSON.stringify( BANNER_JSON_BLANC ) );

    bannerJSONStruct.startDate = startDate;
    bannerJSONStruct.endDate = endDate;

    const [ charName, costumeName, imgName ] = parseName( costumeString );
    bannerJSONStruct.charName = charName;
    bannerJSONStruct.costumeName = costumeName;
    bannerJSONStruct.imgName = imgName;

    bannerArray.push( bannerJSONStruct );
  };

 return bannerArray;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function parseName( costumeString ) {
  const costumeStringArray = costumeString.split( ' ' ).map( s => s.trim() );
  const costumeNameArray = costumeStringArray.slice( 0, -1 );
  const charName = costumeStringArray.at( -1 );
  let costumeName = '';
  let imgName = '';

  costumeNameArray.forEach( ( costumeNamePart, index ) => {
    costumeName += costumeNamePart;
    imgName += costumeNamePart.toLowerCase();
    if ( index === costumeNameArray.length - 1 ) {
      return;
    }
    costumeName += ' ';
    imgName += '_';
  } );

  imgName = checkForDulicateCostumeNames( imgName, charName );

  return [ charName, costumeName, imgName ];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkForDulicateCostumeNames( imgName, charName ) {
  if( DUPLICATED_COSTUME_NAMES.includes( imgName ) ) {
    return `${ imgName }_${ charName.toLowerCase() }`;
  }
  return imgName;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function parseDateString( dateString, publishDate ) {
  const cleanedString = removeOrdinals( dateString );
  let [ start, end ] = cleanedString.split( '-' );

  if( !( start.indexOf( 'AM' ) > -1 ) ) {
    start += ', 4:30 AM'
  } else if ( start.indexOf( '0AM' ) > -1 ) {
    start = start.replace( '0AM', '0 AM' );
  }
  if ( start.match( /12\s+AM/g ) ) {
    start = start.replace( /12\s+AM/g, '12:00' );
  }

  if ( end.indexOf( 'AM' ) > -1 ) {
    end = end.replace( 'AM', 'PM' );
  } else if( !( end.indexOf( 'PM' ) > -1 ) ) {
    end += ', 11:50 PM'
  } else if( end.indexOf( '9PM' ) > -1 ) {
    end = end.replace( '9PM', '9 PM' );
  }
  if( end.indexOf( '11:59' ) > -1 ) {
    end = end.replace( '11:59', '11:59:59' );
  } else if ( end.indexOf( '23:59' ) > -1 ) {
    end = end.replace( '23:59', '11:59:59' );
  }

  let startDate = new Date( `${ start.trim() } UTC` );
  let endDate = new Date( `${ end.trim() } UTC` );
  startDate = checkYear( startDate, start, publishDate );
  endDate = checkYear( endDate, end, publishDate );

  if ( startDate.getUTCHours() === 4 ) {
    startDate = new Date( startDate.getTime() + 86400000 );
  }

  return [ startDate.toISOString(), endDate.toISOString() ];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeOrdinals( dateString ) {
  return dateString.replaceAll( /(\d+)(st|nd|rd|th)/g, "$1" )
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkYear( date, dateString,  publishDate ) {
  let year = 0
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();
  const publishMonth = publishDate.getMonth();
  const publishYear = publishDate.getFullYear();
  //banner starts in jan but no year was included in the dateString
  //so fixing default behaivour from just inserting publishYear
  if( dateMonth === 0 & publishMonth === 11 && dateYear - 1 !== publishYear ) {
    year = publishYear + 1;
  //if no year was in the dateString the default year in those string will be then 2001
  //check if thats the case and correct to publishYear
  //April 7, 12:00 AM --> 2001-04-07.....
  } else if ( dateYear < publishYear - 5 ) {
    year = publishYear;
  } else {
    return date;
  }
  return new Date( `${ dateString.trim() } ${ year } UTC` );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkForMissingImgFiles( bannerArray ) {
  const pngFiles = fs.readdirSync( path.join( 'public', 'images', 'costumes' ) );
  const avifFiles = fs.readdirSync( path.join( 'public', 'images', 'avif', 'costumes' ) );

  for( const banner of bannerArray ) {
    if ( !avifFiles.includes( `${ banner.imgName }.avif` ) ) {
      console.log( makeStrColored( `AVIF for ${ banner.costumeName } ${ banner.charName } is missing! Was looking for ${ banner.imgName }.avif`, COLORS.RED ) );
    }
    if ( !pngFiles.includes( `${ banner.imgName }.png` ) ) {
      console.log( makeStrColored( `PNG for ${ banner.costumeName } ${ banner.charName } is missing!! Was looking for ${ banner.imgName }.png`, COLORS.RED ) );
    }
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addBannersToDataFile( bannerArray ) {
  const dataJSON = JSON.parse( fs.readFileSync( path.join( 'public', 'json', 'data.json' ) ) );
  for( const banner of bannerArray ) {
    if( dataJSON.banner.every( dataBanner => { return banner.imgName !== dataBanner.imgName } ) ) {
      dataJSON.banner.push( banner );
      console.log( makeStrColored( `${ banner.costumeName } ${ banner.charName } - Banner was added to data.json`, COLORS.PURPLE ) );
    }
  }

  dataJSON.banner.sort( ( a, b ) => {
    if ( a.prio > 0 ) {
      return -1;
    }
    if ( !a.prio ) {
      return 1;
    }
    if ( a.startDate === b.startDate ) {
      return a.charName.localeCompare( b.charName );
    }
    return new Date( a.startDate ).getTime() - new Date( b.startDate ).getTime();
  } );

  dataJSON.banner = dataJSON.banner.filter( dataBanner => {
    const isDated = new Date( dataBanner.endDate ).getTime() - new Date().getTime() < 0;
    if ( isDated ) {
      console.log( makeStrColored( `Removing ${ dataBanner.costumeName } ${ dataBanner.charName } - Banner from data.json! Reason: Banner Ended`, COLORS.YELLOW ) );
      dataJSON.tldr = dataJSON.tldr.filter( step => step.id !== dataBanner.imgName );
    }
    return !isDated;
  } )

  checkForMissingImgFiles( dataJSON.banner );
  fs.writeFileSync( path.join( 'public', 'json', 'data.json' ), JSON.stringify( dataJSON, null, 2 ) );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function makeStrColored( str, color ) {
  return `${ color }${ str }\x1b[0m`;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

init();