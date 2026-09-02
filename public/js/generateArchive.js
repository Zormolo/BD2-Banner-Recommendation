let timeLeftUpdateInterval = null;
const timeLeftArray = [];


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createCostumeList( characters, bannerRec ) {
  const costumeList = [];

  for ( const charName of Object.keys( characters ) ) {
    const charInfo = characters[ charName ];

    for ( const costumeInfo of charInfo.costumes ) {
      const imgNameOptions = [
        costumeInfo.name.toLowerCase(),
        `${ costumeInfo.name.toLowerCase() }_${ charName.toLowerCase() }`
      ];
      let imgName = imgNameOptions.find( name => bannerRec[ name ] ?? '' );
      let rec = bannerRec[ imgName ] || null;

      if ( rec ) {
        delete bannerRec[ imgName ];
      }

      const costumeData = {
        id: costumeInfo.id,
        charName: charName.replaceAll( '_', ' ' ),
        costumeName: costumeInfo.name.replaceAll( '_', ' ' ),
        dmgAtt: charInfo.dmgAtt,
        rec: rec || null,
        imgName: imgName
      };

      costumeList.push( costumeData );
    }

  }

  return costumeList;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createCostumeRecCards( costumeList, utils ) {
  /** @type { HTMLDivElement } */
  const container = document.getElementById( 'main-container' );

  /** @type { HTMLTemplateElement } */
  const template = document.getElementById( 'costumeCard' );

  const costumeRoles = utils[ 'costumeRoles' ];
  const damageAttributes = utils[ 'damageAttributes' ];
  const pullPriorityMap = utils[ 'pullPriority' ];
  const modeArray = [ 'gr', 'fh', 'ln', 'tos', 'mw', 'gc', 'gen' ];
  const modeRatings = utils[ 'modeRatings' ];
 
  for ( const costume of costumeList ) {
    const costumeCard = template.content.cloneNode( true );

    const id = costume.id;
    const rec = costume.rec;
    if ( !rec ) {
      continue;
    }

    const section = costumeCard.querySelector( '[ data-char-banner-card ]' );
    section.setAttribute( 'id', id );
    section.removeAttribute( 'data-char-banner-card' );

    //Tabs
    const basicTab = costumeCard.querySelector( '[ data-basic-tab ]' );
    basicTab.dataset.bsTarget = `#basic_${ id }`;
    basicTab.removeAttribute( 'data-basic-tab' );
    const basicTabContent = costumeCard.querySelector( '#basic' );
    basicTabContent.id = `basic_${ id }`;

    const pacTab = costumeCard.querySelector( '[ data-pac-tab ]' );
    pacTab.dataset.bsTarget = `#pac_${ id }`;
    pacTab.removeAttribute( 'data-pac-tab' );
    const pacTabContent = costumeCard.querySelector( '#pac' );
    pacTabContent.id = `pac_${ id }`;

    const modeTab = costumeCard.querySelector( '[ data-mode-tab ]' );
    modeTab.dataset.bsTarget = `#mode_${ id }`;
    modeTab.removeAttribute( 'data-mode-tab' );
    const modeTabContent = costumeCard.querySelector( '#mode' );
    modeTabContent.id = `mode_${ id }`;

    //Basic Info
    const costumeImgAvif = costumeCard.querySelector( '[ data-costume-image-avif ]' );
    costumeImgAvif.srcset = `./public/images/avif/costumes/${ costume.imgName || 'nightmare_bunny' }.avif`;
    costumeImgAvif.removeAttribute( 'data-costume-image-avif' );
    /** @type { HTMLImageElement } */
    const costumeImg = costumeCard.querySelector( '[ data-costume-image ]' );
    costumeImg.src = `./public/images/costumes/${ costume.imgName || 'nightmare_bunny' }.png`;
    costumeImg.alt = costume.imgName;
    costumeImg.title = costume.costumeName;
    costumeImg.fetchPriority = 'high';
    costumeImg.removeAttribute( 'data-costume-image' );

    const cardTitle = costumeCard.querySelector( '[ data-banner-name ]' );
    const title = document.createElement( 'h1' );
    title.textContent = `${ costume.costumeName } ${ costume.charName }`;
    cardTitle.appendChild( title );
    cardTitle.removeAttribute( 'data-banner-name' );

    const roleLine = costumeCard.querySelector( '[ data-role ]' );
    createRoleBadges( roleLine, costumeRoles, rec.roles );
    roleLine.removeAttribute( 'data-role' );

    const dmgAtt = damageAttributes[ costume.dmgAtt ];

    const propertyImg = costumeCard.querySelector( '[ data-property ]' );
    if ( dmgAtt.element ) {
      propertyImg.src = `./public/images/${ dmgAtt.element }.png`;
      propertyImg.alt = dmgAtt.element;
      propertyImg.title = propertyImg.alt;
    }
    propertyImg.removeAttribute( 'data-property' );

    const dmgTypeLine = costumeCard.querySelector( '[ data-dmg-type ]' );
    if ( dmgAtt.dmgType ) {
      const dmgTypeText = document.createTextNode( dmgAtt.dmgType );
      dmgTypeLine.classList.add( `text-${ dmgAtt.dmgType.toLowerCase() }` );
      dmgTypeLine.appendChild( dmgTypeText );
    }
    dmgTypeLine.removeAttribute( 'data-dmg-type' );

    const startDate = new Date( Date.parse( rec.startDate ) );
    const endDate = new Date( Date.parse( rec.endDate ) );
    const periodeLine = costumeCard.querySelector( '[ data-banner-periode ]' );
    const periodeText = document.createTextNode( getBannerPeriodeLocalTimeString( startDate, endDate ) );
    periodeLine.appendChild( periodeText );
    periodeLine.removeAttribute( 'data-banner-periode' );

    const breakpointsContainer = costumeCard.querySelector( '[ data-breakpoints ]' );
    createBreakpoints( breakpointsContainer, rec.breakpoints );
    breakpointsContainer.removeAttribute( 'data-breakpoints' );

    const pullRec = costumeCard.querySelector( '[ data-pull-rec ]' );
    createPullRecommendation( pullRec, pullPriorityMap, rec.pullPriority, rec.pullReason );
    pullRec.removeAttribute( 'data-pull-rec' );

    //Pros and Cons
    const pros = costumeCard.querySelector( '[ data-pros ]' );
    addListElements( pros, rec.pros );
    pros.removeAttribute( 'data-pros' );

    const cons = costumeCard.querySelector( '[ data-cons ]' );
    addListElements( cons, rec.cons );
    cons.removeAttribute( 'data-cons' );

    //Modes
    const costumeModeRatings = rec.modes;
    fillModeRatingTable( costumeCard, modeArray, modeRatings, costumeModeRatings, costume.imgName );

    container.appendChild( costumeCard );
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

function fillModeRatingTable( costumeCard, modeArray, modeRatings, costumeRatings, costumeName ) {
  for( const mode of modeArray ) {
    const modeContainer = costumeCard.querySelector( `[ data-${ mode } ]` );
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
    ratingCol.classList.add( 'col', 'px-0' );
    const ratingContainer = document.createElement( 'div' );
    ratingContainer.textContent = rating;
    ratingCol.append( ratingContainer );

    row.append( colorCol, ratingCol );
    modeContainer.append( row );
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function init() {
  const [ characters, archiveData, utils ] = await Promise.all( [
    fetch( './public/json/character_info.json' ).then( res => res.json() ),
    fetch( './public/json/archive_data.json' ).then( res => res.json() ),
    fetch( './public/json/utils.json' ).then( res => res.json() )
  ] );

  const s = performance.now();
  const costumeList = createCostumeList( characters, archiveData );

  if ( Object.keys( archiveData ).length > 0 ) {
    console.error( archiveData );
  }

  createCostumeRecCards( costumeList, utils );
  console.log( ( performance.now() - s ) + " ms" )
}
init();