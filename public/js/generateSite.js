let timeLeftUpdateInterval = null;
const timeLeftArray = [];


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTldr( dataArray ) {
  const container = document.querySelector( '[ data-tldr ]' );
  const arrow = String.fromCharCode( '10230' );

  for( const [ i , [ costumeName, dupesArray ] ] of dataArray.entries() ) {
    container.append( costumeName, ' [' );

    for( let f = 0; f < dupesArray.length; f++ ) {
      const picture = document.createElement( 'picture' );
      picture.classList.add( 'px-1' );

      const dupe = Number( dupesArray[ f ] );

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
      container.appendChild( picture );

      if ( dupesArray.length > 1 && f < dupesArray.length - 1  ) {
        container.append( '|' );
      }
    }

    container.append( '] ' );

    if ( i < dataArray.length - 1 ) {
      container.append( arrow, ' ' );
    }
  }
  container.removeAttribute( 'data-tldr' );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createBannerCards( bannerData, damageAttributes ) {
  /** @type { HTMLDivElement } */
  const container = document.getElementById( 'main-container' );

  /** @type { HTMLTemplateElement } */
  const template = document.getElementById( 'charBannerCard' );

  const modesArray = [ 'gr', 'fh', 'ln', 'tos', 'mw', 'gc', 'gen' ];

  for( const bannerChar of bannerData ) {
    const bannerCard = template.content.cloneNode( true );

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
    cardTitle.classList.remove( 'data-banner-name' );

    const roleLine = bannerCard.querySelector( '[ data-role ]' )
    const roleText = document.createTextNode( bannerChar.role );
    roleLine.appendChild( roleText );
    roleLine.classList.remove( 'data-role' );

    const propertyImg = bannerCard.querySelector( '[ data-property ]' );
    propertyImg.src = `./public/images/${ dmgAtt.element }.png`;
    propertyImg.alt = dmgAtt.element;
    propertyImg.title = propertyImg.alt;
    propertyImg.classList.remove( 'data-property' );

    const dmgTypeLine = bannerCard.querySelector( '[ data-dmg-type ]' );
    const dmgTypeText = document.createTextNode( dmgAtt.dmgType );
    dmgTypeLine.appendChild( dmgTypeText );
    dmgTypeLine.classList.remove( 'data-dmg-type' );

    const startDate = new Date( Date.parse( bannerChar.startDate ) );
    const endDate = new Date( Date.parse( bannerChar.endDate ) );
    const periodeLine = bannerCard.querySelector( '[ data-banner-periode ]' );
    const periodeText = document.createTextNode( getBannerPeriodeLocalTimeString( startDate, endDate ) );
    periodeLine.appendChild( periodeText );
    periodeLine.classList.remove( 'data-banner-periode' );

    const timeLeftLine = bannerCard.querySelector( '[ data-banner-time-left ]' );
    const [ days, hours, minutes ] = calcTimeLeftOnBanner( endDate );
    if ( days < 0 || hours < 0 || minutes < 0 ) {
      continue;
    }
    if ( checkBannerStarted( startDate ) ) {
      timeLeftLine.append( `Banner didn${ String.fromCharCode( 39 ) }t start yet!` ); //39 -> '
    } else {
      const timeLeftContainer = getTimeLeftSpan( [ days, hours, minutes ] );
      timeLeftLine.append( 'Banner ends in ', timeLeftContainer, ' !' );
      timeLeftArray.push( [ endDate, timeLeftContainer ] );
    }
    timeLeftLine.classList.remove( 'data-banner-time-left' );

    const breakpointsContainer = bannerCard.querySelector( '[ data-breakpoints ]' );
    createBreakpoints( breakpointsContainer, bannerChar.breakpoints );
    breakpointsContainer.classList.remove( 'data-breakpoints' );

    const pullReason = bannerCard.querySelector( '[ data-pull-reason ]' );
    pullReason.innerHTML = bannerChar.pullReason;
    pullReason.classList.remove( 'data-pull-reason' );

    //Pros and Cons
    const pros = bannerCard.querySelector( '[ data-pros ]' );
    addListElements( pros, bannerChar.pros );
    pros.classList.remove( 'data-pros' );

    const cons = bannerCard.querySelector( '[ data-cons ]' );
    addListElements( cons, bannerChar.cons );
    cons.classList.remove( 'data-cons' );

    //Modes
    const bannerCharModeSuggestions = bannerChar.modes;
    for( const mode of modesArray ) {
      const modeContainer = bannerCard.querySelector( `[ data-${ mode } ]` );
      modeContainer.removeAttribute( `data-${ mode }` );
      const suggestion = bannerCharModeSuggestions?.[ mode ];
      if ( suggestion || typeof suggestion === 'string'  ) {
        modeContainer.textContent = suggestion;
        continue;
      }
      modeContainer.textContent = String.fromCharCode( 8212 );
    }

    container.appendChild( bannerCard );
  }

  template.remove();
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

function getTimeLeftSpan( [ days, hours, minutes ] ) {
  let textColor = 'text-warning';
  if ( days < 4 ) {
    textColor = 'text-danger'
  }

  const timeLeftContainer = document.createElement( 'span' );
  timeLeftContainer.classList.add( textColor );
  timeLeftContainer.textContent = createTimeLeftString( [ days, hours, minutes ] );

  return timeLeftContainer;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calcTimeLeftOnBanner( end ) {
  let dateDiff = end.getTime() - new Date().getTime();

  const daysLeft = Math.trunc( dateDiff / ( 1000 * 60 * 60 * 24 ) );
  dateDiff %= ( 1000 * 60 * 60 * 24 );

  const hoursLeft = Math.trunc( dateDiff / ( 1000 * 60 * 60 ) );
  dateDiff %= ( 1000 * 60 * 60 );

  const minutesLeft = Math.trunc( dateDiff / ( 1000 * 60 ) );

  return [ daysLeft, hoursLeft, minutesLeft ];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTimeLeftString( [ days, hours, minutes ] ) {
  const daysLeft = String( days ).padStart( 2, '0' );
  const hoursLeft = String( hours ).padStart( 2, '0' );
  const minutesLeft = String( minutes ).padStart( 2, '0' );

  return `${ daysLeft } D : ${ hoursLeft } h : ${ minutesLeft } min`;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createBreakpoints( container, breakpoints ) {
  for( const [ dupe, comment ] of breakpoints ) {
    const listElement = document.createElement( 'li' );
    listElement.classList.add( 'list-group-item' );

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

    const breakpointComment = document.createElement( 'span' );
    breakpointComment.innerHTML = comment;
    listElement.append( picture, breakpointComment );

    container.appendChild( listElement );
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

function initTimeLeftInterval() {
  const now = new Date();
  const msUntilNextMin = ( 60 - now.getSeconds() ) * 1000 - now.getMilliseconds();

  setTimeout( () => {
    updateBannerTimeLeft();
    timeLeftUpdateInterval = setInterval( updateBannerTimeLeft, 60000 );
  }, msUntilNextMin );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateBannerTimeLeft() {
  for( const [ endDate, span ] of timeLeftArray ) {
    const timeLeft = calcTimeLeftOnBanner( endDate );
    span.textContent = createTimeLeftString( timeLeft );
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function init() {
  const res = await fetch( './public/json/data.json' );
  const jsonData = await res.json();

  createTldr( jsonData[ 'tldr' ] );

  createBannerCards( jsonData[ 'banner' ], jsonData[ 'damageAttributes' ] );

  initTimeLeftInterval();
}
init();