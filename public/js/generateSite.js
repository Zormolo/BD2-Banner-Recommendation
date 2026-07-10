const DAY_IN_MS = 86400000;
const HOUR_IN_MS = 3600000;
const MIN_IN_MS = 60000;

let timeLeftUpdateInterval = null;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTldr( dataArray ) {
  const container = document.querySelector( '[ data-tldr ]' );
  const arrow = String.fromCharCode( '10230' );

  for( let i = 0; i < dataArray.length; ++i ) {
    const step = dataArray[ i ];
    const stepContainer = document.createElement( 'div' );
    stepContainer.classList.add( 'flex-grow-0', 'pe-2' );
    stepContainer.setAttribute( 'data-tldr-step', step.id );
    stepContainer.append( step.displayName );
    const picture = document.createElement( 'picture' );
    picture.classList.add( 'px-1' );

    const dupe = step.costumeUpgrade;

    const source = document.createElement( 'source' );
    source.srcset = `./public/images/avif/${ dupe }.avif`;
    source.type = 'image/avif';

    const dupeImg = document.createElement( 'img' );
    dupeImg.src = `./public/images/${ dupe }.png`;
    const dupeAmount = dupe + 1;
    dupeImg.alt = `${ dupeAmount }_dupes.png`;
    dupeImg.title = `Needed Copies: ${ dupeAmount }`;
    dupeImg.loading = 'lazy';
    dupeImg.width = 30;
    dupeImg.height = 25;

    picture.append( source, dupeImg );
    stepContainer.appendChild( picture );

    if ( i < dataArray.length - 1 ) {
      const arrowContainer = document.createElement( 'span' );
      arrowContainer.classList.add( 'ps-2' );
      arrowContainer.textContent = arrow;
      stepContainer.append( arrowContainer );
    }

    container.append( stepContainer );
  }
  container.removeAttribute( 'data-tldr' );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createBannerCards( bannerData, utils ) {
  /** @type { HTMLDivElement } */
  const container = document.getElementById( 'main-container' );

  /** @type { HTMLTemplateElement } */
  const template = document.getElementById( 'charBannerCard' );

  /** @type { HTMLSelectElement } */
  const shortcutContainerSmall = document.querySelector( '[ data-shortcut-container-small ]' );
  shortcutContainerSmall.addEventListener( 'change', ( event ) => {
    document.getElementById( event.target.value ).scrollIntoView( { behavior: "smooth", block: "start", inline: "nearest" } );
  } );
  shortcutContainerSmall.removeAttribute( 'data-shortcut-container-small' );

  /** @type { HTMLSelectElement } */
  const shortcutContainerBig = document.querySelector( '[ data-shortcut-container-big ]' );
  shortcutContainerBig.addEventListener( 'change', ( event ) => {
    document.getElementById( event.target.value ).scrollIntoView( { behavior: "smooth", block: "start", inline: "nearest" } );
  } );
  shortcutContainerBig.removeAttribute( 'data-shortcut-container-big' );

  const costumeRoles = utils[ 'costumeRoles' ];
  const damageAttributes = utils[ 'damageAttributes' ];
  const pullPriorityMap = utils[ 'pullPriority' ];
  const modeArray = [ 'gr', 'fh', 'ln', 'tos', 'mw', 'gc', 'gen' ];
  const modeRatings = utils[ 'modeRatings' ];

  for( const bannerChar of bannerData ) {
    const bannerCard = template.content.cloneNode( true );

    const section = bannerCard.querySelector( '[ data-char-banner-card ]' );
    section.setAttribute( 'id', bannerChar.imgName );
    section.removeAttribute( 'data-char-banner-card' );

    //Tabs
    const basicTab = bannerCard.querySelector( '[ data-basic-tab ]' );
    basicTab.dataset.bsTarget = `#basic_${ bannerChar.imgName }`;
    basicTab.removeAttribute( 'data-basic-tab' );
    const basicTabContent = bannerCard.querySelector( '#basic' );
    basicTabContent.id = `basic_${ bannerChar.imgName }`;

    const pacTab = bannerCard.querySelector( '[ data-pac-tab ]' );
    pacTab.dataset.bsTarget = `#pac_${ bannerChar.imgName }`;
    pacTab.removeAttribute( 'data-pac-tab' );
    const pacTabContent = bannerCard.querySelector( '#pac' );
    pacTabContent.id = `pac_${ bannerChar.imgName }`;

    const modeTab = bannerCard.querySelector( '[ data-mode-tab ]' );
    modeTab.dataset.bsTarget = `#mode_${ bannerChar.imgName }`;
    modeTab.removeAttribute( 'data-mode-tab' );
    const modeTabContent = bannerCard.querySelector( '#mode' );
    modeTabContent.id = `mode_${ bannerChar.imgName }`;

    //Basic Info
    const costumeImgAvif = bannerCard.querySelector( '[ data-costume-image-avif ]' );
    costumeImgAvif.srcset = `./public/images/avif/costumes/${ bannerChar.imgName }.avif`;
    costumeImgAvif.removeAttribute( 'data-costume-image-avif' );
    /** @type { HTMLImageElement } */
    const costumeImg = bannerCard.querySelector( '[ data-costume-image ]' );
    costumeImg.src = `./public/images/costumes/${ bannerChar.imgName }.png`;
    costumeImg.alt = bannerChar.imgName;
    costumeImg.title = bannerChar.costumeName;
    costumeImg.removeAttribute( 'data-costume-image' );

    const dmgAtt = damageAttributes[ bannerChar.dmgAtt ];

    const cardTitle = bannerCard.querySelector( '[ data-banner-name ]' );
    const title = document.createElement( 'h1' );
    title.textContent = `${ bannerChar.costumeName } ${ bannerChar.charName }`;
    cardTitle.appendChild( title );
    cardTitle.removeAttribute( 'data-banner-name' );

    const roleLine = bannerCard.querySelector( '[ data-role ]' );
    createRoleBadges( roleLine, costumeRoles, bannerChar.roles );
    roleLine.removeAttribute( 'data-role' );

    const propertyImg = bannerCard.querySelector( '[ data-property ]' );
    if ( dmgAtt.element ) {
      propertyImg.src = `./public/images/${ dmgAtt.element }.png`;
      propertyImg.alt = dmgAtt.element;
      propertyImg.title = propertyImg.alt;
    }
    propertyImg.removeAttribute( 'data-property' );

    const dmgTypeLine = bannerCard.querySelector( '[ data-dmg-type ]' );
    const dmgTypeText = document.createTextNode( dmgAtt.dmgType );
    dmgTypeLine.appendChild( dmgTypeText );
    dmgTypeLine.classList.add( `text-${ dmgAtt.dmgType.toLowerCase() }` );
    dmgTypeLine.removeAttribute( 'data-dmg-type' );

    const startDate = new Date( Date.parse( bannerChar.startDate ) );
    const endDate = new Date( Date.parse( bannerChar.endDate ) );
    const periodeLine = bannerCard.querySelector( '[ data-banner-periode ]' );
    const periodeText = document.createTextNode( getBannerPeriodeLocalTimeString( startDate, endDate ) );
    periodeLine.appendChild( periodeText );
    periodeLine.removeAttribute( 'data-banner-periode' );
    const timeLeftLine = bannerCard.querySelector( '[ data-banner-time-left ]' );
    const [ days, hours, minutes, seconds ] = calcTimeLeftOnBanner( endDate );
    if ( days < 0 || hours < 0 || minutes < 0 || seconds < 0 ) {
      removeTldrContainerElement( bannerChar.imgName );
      continue;
    }
    if ( checkBannerStarted( startDate ) ) {
      timeLeftLine.append( `Banner didn${ String.fromCharCode( 39 ) }t start yet!` ); //39 -> '
    } else {
      const timeLeftContainer = getTimeLeftSpan( [ days, hours, minutes, seconds ] );
      timeLeftContainer.dataset.endDate = bannerChar.endDate;
      timeLeftLine.append( 'Banner ends in ', timeLeftContainer, ' !' );
    }
    timeLeftLine.removeAttribute( 'data-banner-time-left' );

    const breakpointsContainer = bannerCard.querySelector( '[ data-breakpoints ]' );
    if ( bannerChar.breakpoints[ 0 ].length > 0 ) {
      createBreakpoints( breakpointsContainer, bannerChar.breakpoints );
    }
    breakpointsContainer.removeAttribute( 'data-breakpoints' );

    const pullRec = bannerCard.querySelector( '[ data-pull-rec ]' );
    createPullRecommendation( pullRec, pullPriorityMap, bannerChar.pullPriority, bannerChar.pullReason );
    pullRec.removeAttribute( 'data-pull-rec' );

    //Pros and Cons
    const pros = bannerCard.querySelector( '[ data-pros ]' );
    addListElements( pros, bannerChar.pros );
    pros.removeAttribute( 'data-pros' );

    const cons = bannerCard.querySelector( '[ data-cons ]' );
    addListElements( cons, bannerChar.cons );
    cons.removeAttribute( 'data-cons' );

    //Modes
    const bannerCharModeSuggestions = bannerChar.modes;
    fillModeRatingTable( bannerCard, modeArray, modeRatings, bannerCharModeSuggestions, bannerChar.imgName );

    container.appendChild( bannerCard );

    const shortcutOptionSmall = document.createElement( 'option' );
    shortcutOptionSmall.textContent = `${ bannerChar.costumeName } ${ bannerChar.charName }`;
    shortcutOptionSmall.value = bannerChar.imgName;
    shortcutContainerSmall.append( shortcutOptionSmall );

    const shortcutOptionBig = document.createElement( 'option' );
    shortcutOptionBig.textContent = `${ bannerChar.costumeName } ${ bannerChar.charName }`;
    shortcutOptionBig.value = bannerChar.imgName;
    shortcutContainerBig.append( shortcutOptionBig );
  }

  template.remove();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createRoleBadges( container, roleArray, roles ) {
  for ( const role of roleArray ) {
    if ( !roles.includes( role ) ) {
      continue;
    }
    const badge = document.createElement( 'span' );
    badge.classList.add( 'badge', 'bg-secondary-subtle', 'me-1', 'p-2' );
    badge.textContent = role;
    container.append( badge );
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getBannerPeriodeLocalTimeString( start, end ) {
  return `
    ${ start.toLocaleDateString() } ${ String.fromCharCode( 8212 ) } ${ end.toLocaleDateString() }
  `;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkBannerStarted( start ) {
  return ( start.getTime() - new Date().getTime() ) > 0;
}

function getTimeLeftSpan( [ days, hours, minutes, seconds ] ) {
  let textColor = 'text-teal';
  if ( days < 7 ) {
    textColor = 'text-warning';
  }
  if ( days < 3 ) {
    textColor = 'text-danger';
  }

  const timeLeftContainer = document.createElement( 'span' );
  timeLeftContainer.classList.add( textColor );
  timeLeftContainer.textContent = createTimeLeftString( [ days, hours, minutes, seconds ] );

  return timeLeftContainer;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calcTimeLeftOnBanner( end ) {
  let dateDiff = end.getTime() - new Date().getTime();

  const daysLeft = Math.trunc( dateDiff / DAY_IN_MS );
  dateDiff %= DAY_IN_MS;

  const hoursLeft = Math.trunc( dateDiff / HOUR_IN_MS );
  dateDiff %= HOUR_IN_MS;

  const minutesLeft = Math.trunc( dateDiff / MIN_IN_MS );
  dateDiff %= MIN_IN_MS;

  const secondsLeft = Math.trunc( dateDiff / 1000 );

  return [ daysLeft, hoursLeft, minutesLeft, secondsLeft ];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTimeLeftString( [ days, hours, minutes, seconds ] ) {
  const daysLeft = String( days ).padStart( 2, '0' );
  const hoursLeft = String( hours ).padStart( 2, '0' );
  const minutesLeft = String( minutes ).padStart( 2, '0' );
  const secondsLeft = String( seconds ).padStart( 2, '0' );

  return `${ daysLeft } D : ${ hoursLeft } h : ${ minutesLeft } min : ${ secondsLeft } sec`;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeTldrContainerElement( charId ) {
  const result = document.querySelectorAll( `[ data-tldr-step=${ charId } ]` );
  for ( const container of result ) {
    container.remove();
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createBreakpoints( container, breakpoints ) {
  for( const [ dupe, comment ] of breakpoints ) {
    const listElement = document.createElement( 'li' );
    listElement.classList.add( 'list-group-item' );

    const listContainer = document.createElement( 'div' );
    listContainer.classList.add( 'container-fluid' );

    const row = document.createElement( 'div' );
    row.classList.add( 'row', 'flex-row' );

    const pictureCol = document.createElement( 'div' );
    pictureCol.classList.add( 'col-auto', 'px-0', 'align-content-center' );
    const picture = document.createElement( 'picture' );
    picture.classList.add( 'pe-2' );

    const source = document.createElement( 'source' );
    source.srcset = `./public/images/avif/${ dupe }.avif`;
    source.type = 'image/avif';

    const dupeImg = document.createElement( 'img' );
    dupeImg.src = `./public/images/${ dupe }.png`;
    const dupeAmount = Number( dupe ) + 1;
    dupeImg.alt = `${ dupeAmount }_dupes.png`;
    dupeImg.title = `Needed Copies: ${ dupeAmount }`;
    dupeImg.loading = 'lazy';
    dupeImg.width = 42;
    dupeImg.height = 35;

    picture.append( source, dupeImg );
    pictureCol.append( picture );

    const breakpointComment = document.createElement( 'div' );
    breakpointComment.classList.add( 'col', 'text-start', 'align-content-center' );
    breakpointComment.textContent = comment.replaceAll( '&rarr;', String.fromCharCode( '10230' ) );

    row.append( pictureCol, breakpointComment );
    listContainer.append( row );
    listElement.append( listContainer );
    container.append( listElement );
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addListElements( list, dataArray ) {
  if ( dataArray === undefined || dataArray.length === 0 ) {
    const listElement = document.createElement( 'li' );
    listElement.classList.add( 'list-group-item' );
    listElement.textContent = 'Nothing noteworthy!';
    list.appendChild( listElement );
    return;
  }

  for ( const point of dataArray ) {
    const listElement = document.createElement( 'li' );
    listElement.classList.add( 'list-group-item' );
    listElement.textContent = point;
    list.appendChild( listElement );
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createPullRecommendation( container, map, prio, reason ) {
  const prioContainer = document.createElement( 'b' );
  prioContainer.classList.add( `text-${ prio }` );
  prioContainer.textContent = map[ prio ];

  container.append( prioContainer );
  container.innerHTML += ` ${ reason }`;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillModeRatingTable( bannerCard, modeArray, modeRatings, costumeRatings, costumeName ) {
  for( const mode of modeArray ) {
    const modeContainer = bannerCard.querySelector( `[ data-${ mode } ]` );
    modeContainer.removeAttribute( `data-${ mode }` );
    const rating = costumeRatings?.[ mode ];
    if ( !( rating && typeof rating === 'string' ) ) {
      modeContainer.textContent = String.fromCharCode( 8212 );
      continue;
    }
    const ratingColor = modeRatings[ rating ] || '';
    if ( !ratingColor ) {
      console.error( `Not valid rating! [ ${ costumeName } : ${ mode } = ${ rating } ]` );
      modeContainer.textContent = String.fromCharCode( 8212 );
      continue;
    }

    const row = document.createElement( 'div' );
    row.classList.add( 'row', 'align-items-center' );

    const colorCol = document.createElement( 'div' );
    colorCol.classList.add( 'col-auto', 'pe-0' );
    const colorContainer = document.createElement( 'span' );
    colorContainer.classList.add( 'ratingColorBox', `bg-${ ratingColor }`, 'rounded-1' );
    colorCol.append( colorContainer );

    const ratingCol = document.createElement( 'div' );
    ratingCol.classList.add( 'col', 'px-0');
    const ratingContainer = document.createElement( 'div' );
    ratingContainer.textContent = rating;
    ratingCol.append( ratingContainer );

    row.append( colorCol, ratingCol );
    modeContainer.append( row );
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initTimeLeftInterval() {
  const msUntilNextSec = 1000 - new Date().getMilliseconds();

  setTimeout( () => {
    updateBannerTimeLeft();
    timeLeftUpdateInterval = setInterval( updateBannerTimeLeft, 1000 );
  }, msUntilNextSec );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateBannerTimeLeft() {
  document.querySelectorAll( '[ data-end-date ]' ).forEach( element => {
    const timeArray = calcTimeLeftOnBanner( new Date( element.dataset.endDate ) );
    element.textContent =  createTimeLeftString( timeArray );
  } );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function init() {
  const [ jsonData, utils ] = await Promise.all( [
    fetch( './public/json/data.json' ).then( res => res.json() ),
    fetch( './public/json/utils.json' ).then( res => res.json() )
  ] );

  createTldr( jsonData[ 'tldr' ] );

  createBannerCards( jsonData[ 'banner' ], utils );

  initTimeLeftInterval();
}
init();