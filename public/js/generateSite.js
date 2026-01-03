function getBannerCards( jsonData ) {
  const cardArray = [];

  /** @type { HTMLTemplateElement } */
  const template = document.getElementById( 'charBannerCard' );

  for( const bannerChar of jsonData[ "banner" ] ) {
    const bannerCard = template.content.cloneNode( true );

    /** @type { HTMLImageElement } */
    const costumeImg = bannerCard.querySelector(".costumeImg");
    costumeImg.src = `./public/images/costumes/${ bannerChar.imgName }.png`;
    costumeImg.alt = bannerChar.imgName;
    costumeImg.title = bannerChar.costumeName;

    const cardTitle = bannerCard.querySelector(".bannerName");
    const title = document.createElement( 'h1' );
    title.textContent = `${ bannerChar.costumeName } ${ bannerChar.charName }`;
    cardTitle.appendChild( title );

    bannerCard.querySelector(".role").innerHTML += bannerChar.role;

    const propertyImg = bannerCard.querySelector(".property");
    propertyImg.src = `./public/images/${ bannerChar.element }.png`;
    propertyImg.alt = bannerChar.element;
    propertyImg.title = bannerChar.element;

    bannerCard.querySelector(".dmgType").innerHTML += bannerChar.dmgType;

    bannerCard.querySelector(".date").innerHTML += getBannerDateString( bannerChar.startDate, bannerChar.endDate );

    bannerCard.querySelector( ".breakpoints" ).innerHTML = getBreakpoints( bannerChar.breakpoints );

    bannerCard.querySelector( ".pullReason" ).innerHTML = bannerChar.pullReason;

    cardArray.push( bannerCard );
  }

  return cardArray;
}

function getBannerDateString( start, end ) {
  const startDate = new Date( Date.parse( start ) );
  const endDate = new Date( Date.parse( end ) );
  const periode = `<li>${ startDate.toLocaleDateString() } &#8212; ${ endDate.toLocaleDateString() }</li>`;

  let dateDiff = endDate.getTime() - new Date().getTime();

  const daysLeft = Math.trunc( dateDiff / ( 1000 * 60 * 60 * 24 ) );
  dateDiff %= ( 1000 * 60 * 60 * 24 );

  const hoursLeft = Math.trunc( dateDiff / ( 1000 * 60 * 60 ) );
  dateDiff %= ( 1000 * 60 * 60 );

  const minutesLeft = Math.trunc( dateDiff / ( 1000 * 60 ) );

  let textColor = "text-warning";
  if ( daysLeft < 4 ) {
    textColor = "text-danger"
  }

  const timeLeft = `<li>Banner ends in <span class="${ textColor }">${ daysLeft } D : ${ hoursLeft } h : ${ minutesLeft } min</span> !</li>`;
  return periode + timeLeft;
}

function getBreakpoints( breakpoints ) {
  let breakpointString = "";

  for( const [dupe, comment] of breakpoints ) {
    breakpointString += `<li class="list-group-item"><img class="pe-2" src="./public/images/${ dupe }.png" width="40px" height="32px"> ${ comment }</li>`;
  }
  return breakpointString;
}

async function init() {
  const res = await fetch( "./public/json/data.json" );
  const data = await res.json();

  /** @type { HTMLDivElement } */
  const container = document.getElementById( "main-container" );
  for( const bannerCard of getBannerCards( data ) ) {
    container.appendChild( bannerCard );
  }
  console.log(data)
}
init();