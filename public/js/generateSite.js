let timeLeftUpdateInterval = null;
const timeLeftArray = [];


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTldr( dataArray ) {
  const container = document.getElementById( 'tldr' );
  const arrow = String.fromCharCode( '10230' );
  for( const [ i , [ costumeName, dupesArray ] ] of dataArray.entries() ) {
    container.append( costumeName, ' [' );

    for( let f = 0; f < dupesArray.length; f++ ) {
      const dupe = dupesArray[ f ];
      const dupeImg = document.createElement( 'img' );
      dupeImg.src = `./public/images/${ dupe }.png`;
      dupeImg.classList.add( 'px-1' );
      const dupeAmount = Number( dupe ) + 1;
      dupeImg.alt = `${ dupeAmount }_dupes.png`;
      dupeImg.title = `Needed Copies: ${ dupeAmount }`;
      dupeImg.loading = 'lazy';
      dupeImg.width = 33;
      dupeImg.height = 22;
      container.append( dupeImg );

      if ( dupesArray.length > 1 && f < dupesArray.length - 1  ) {
        container.append( '|' );
      }
    }

    container.append( '] ' );

    if ( i < dataArray.length - 1 ) {
      container.append( arrow, ' ' );
    }
  }
  container.removeAttribute( 'id' );
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createBannerCards( bannerData, damageAttributes ) {
  /** @type { HTMLDivElement } */
  const container = document.getElementById( 'main-container' );

  /** @type { HTMLTemplateElement } */
  const template = document.getElementById( 'charBannerCard' );

  for( const bannerChar of bannerData ) {
    const bannerCard = template.content.cloneNode( true );

    //Tabs
    const basicTab = bannerCard.querySelector( '#basicTab' );
    basicTab.dataset.bsTarget = `#basic_${ bannerChar.imgName }`;
    basicTab.removeAttribute( 'id' );
    const basicTabContent = bannerCard.querySelector( '#basic' );
    basicTabContent.id = `basic_${ bannerChar.imgName }`;

    const pacTab = bannerCard.querySelector( '#pacTab' );
    pacTab.dataset.bsTarget = `#pac_${ bannerChar.imgName }`;
    pacTab.removeAttribute( 'id' );
    const pacTabContent = bannerCard.querySelector( '#pac' );
    pacTabContent.id = `pac_${ bannerChar.imgName }`;

    const modeTab = bannerCard.querySelector( '#modeTab' );
    modeTab.dataset.bsTarget = `#mode_${ bannerChar.imgName }`;
    modeTab.removeAttribute( 'id' );
    const modeTabContent = bannerCard.querySelector( '#mode' );
    modeTabContent.id = `mode_${ bannerChar.imgName }`;

    //Basic Info
    /** @type { HTMLImageElement } */
    const costumeImg = bannerCard.querySelector( '.costumeImg' );
    costumeImg.src = `./public/images/costumes/${ bannerChar.imgName }.png`;
    costumeImg.alt = bannerChar.imgName;
    costumeImg.title = bannerChar.costumeName;
    costumeImg.classList.remove( 'costumeImg' );

    const dmgAtt = damageAttributes[ bannerChar.dmgAtt ];

    const cardTitle = bannerCard.querySelector( '.bannerName' );
    const title = document.createElement( 'h1' );
    title.textContent = `${ bannerChar.costumeName } ${ bannerChar.charName }`;
    cardTitle.appendChild( title );
    cardTitle.classList.remove( 'bannerName' );

    const roleLine = bannerCard.querySelector( '.role' )
    const roleText = document.createTextNode( bannerChar.role );
    roleLine.appendChild( roleText );
    roleLine.classList.remove( 'role' );

    const propertyImg = bannerCard.querySelector( '.property' );
    propertyImg.src = `./public/images/${ dmgAtt.element }.png`;
    propertyImg.alt = dmgAtt.element;
    propertyImg.title = propertyImg.alt;
    propertyImg.classList.remove( 'property' );

    const dmgTypeLine = bannerCard.querySelector( '.dmgType' );
    const dmgTypeText = document.createTextNode( dmgAtt.dmgType );
    dmgTypeLine.appendChild( dmgTypeText );
    dmgTypeLine.classList.remove( 'dmgType' );

    const startDate = new Date( Date.parse( bannerChar.startDate ) );
    const endDate = new Date( Date.parse( bannerChar.endDate ) );
    const periodeLine = bannerCard.querySelector( '.bannerPeriode' );
    const periodeText = document.createTextNode( getBannerPeriodeLocalTimeString( startDate, endDate ) );
    periodeLine.appendChild( periodeText );
    periodeLine.classList.remove( 'bannerPeriode' );

    const timeLeftLine = bannerCard.querySelector( '.bannerTimeLeft' );
    const timeLeftContainer = getTimeLeftSpan( endDate );
    timeLeftLine.append( 'Banner ends in ', timeLeftContainer, ' !' );
    timeLeftLine.classList.remove( 'bannerTimeLeft' );
    timeLeftArray.push( [ endDate, timeLeftContainer ] );

    const breakpointsContainer = bannerCard.querySelector( '.breakpoints' );
    createBreakpoints( breakpointsContainer, bannerChar.breakpoints );
    breakpointsContainer.classList.remove( 'breakpoints' );

    const pullReason = bannerCard.querySelector( '.pullReason' );
    pullReason.innerHTML = bannerChar.pullReason;
    pullReason.classList.remove( 'pullReason' );

    //Pros and Cons
    const pros = bannerCard.querySelector( '.pros' );
    addListElements( pros, bannerChar.pros );
    pros.classList.remove( 'pros' );

    const cons = bannerCard.querySelector( '.cons' );
    addListElements( cons, bannerChar.cons );
    cons.classList.remove( 'cons' );

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

function getTimeLeftSpan( end ) {
  const timeLeft = calcTimeLeftOnBanner( end );

  let textColor = 'text-warning';
  if ( timeLeft[0] < 4 ) {
    textColor = 'text-danger'
  }

  const timeLeftContainer = document.createElement( 'span' );
  timeLeftContainer.classList.add( textColor );
  timeLeftContainer.textContent = createTimeLeftString( timeLeft );

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
  for( const [dupe, comment] of breakpoints ) {
    const listElement = document.createElement( 'li' );
    listElement.classList.add( 'list-group-item' );
    const dupeImg = document.createElement( 'img' );
    dupeImg.src = `./public/images/${ dupe }.png`;
    const dupeAmount = Number( dupe ) + 1;
    dupeImg.alt = `${ dupeAmount }_dupes.png`;
    dupeImg.title = `Needed Copies: ${ dupeAmount }`;
    dupeImg.classList.add( 'pe-2' );
    dupeImg.loading = 'lazy';
    dupeImg.width = 48;
    dupeImg.height = 32;
    const breakpointComment = document.createElement( 'span' );
    breakpointComment.innerHTML = comment;
    listElement.append( dupeImg, breakpointComment );
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

  await createBannerCards( jsonData[ 'banner' ], jsonData[ 'damageAttributes' ] );

  initTimeLeftInterval();
}
init();