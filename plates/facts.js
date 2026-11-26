// Facts about US license plates, per state. Front-plate status as of late 2026.
// Sources: Wikipedia "Vehicle registration plates of <State>" pages and the US overview page (mounting table),
// plus statute/DMV checks for partial cases (Idaho Code 49-428/ITD, RI legislature, NE LB 97, MT 61-3-301, NV DMV/NRS 482.275, MA c.90 s.6, HRS 249-7, FL 320.0706).
const FACTS = {
  "Alabama": {
    frontPlate: false,
    frontNote: "Alabama requires a plate on the rear only (since 1963).",
    nickname: "Heart of Dixie",
    trivia: [
      "Alabama issued its first annual plates on October 1, 1911; plate #1 went to a Montgomery funeral home.",
      "Serial letters I, O and Q are skipped, and the characters count up 0-9 then A-Y from right to left."
    ],
    designs: "The current plate (January 2022) shows a sunrise beach scene with 'Heart of Dixie' in a heart outline at bottom right."
  },
  "Alaska": {
    frontPlate: false,
    frontNote: "Alaska requires a plate on the rear only (since August 2022).",
    nickname: "The Last Frontier",
    trivia: [
      "Alaska's first plate was issued on May 21, 1921, while it was still a territory.",
      "About 9,000 pairs of a 1973 plate were rejected by Governor Egan because the flag on them had dots instead of stars."
    ],
    designs: "The standard plate is blue on golden yellow with the state flag in the center; bear, Artistic License and fireweed plates are alternatives."
  },
  "Arizona": {
    frontPlate: false,
    frontNote: "Arizona requires a plate on the rear only (since 1989); some specialty plates come in pairs but the front is optional.",
    nickname: "Grand Canyon State",
    trivia: [
      "Arizona required registration in 1912 but did not issue plates until 1914.",
      "The 1996 desert design was named 'Plate of the Year' by plate collectors, the first time Arizona won."
    ],
    designs: "The classic plate shows a desert sunset with cacti and Four Peaks-style mountains; the design dates from 1996 and was flat-printed in 2008."
  },
  "Arkansas": {
    frontPlate: false,
    frontNote: "Arkansas requires a plate on the rear only (since 1944).",
    nickname: "The Natural State",
    trivia: [
      "Arkansas plates for 1944 were made of fiberboard to save metal during World War II.",
      "The rare 1914 plate had to be turned in to get the 1915 renewal, so few survive."
    ],
    designs: "The current plate has carried 'The Natural State' since March 2006; the ABC 12D serial format began in April 2021."
  },
  "California": {
    frontPlate: true,
    frontNote: "California requires plates on both the front and rear.",
    trivia: [
      "Since 1947, California plates have been made by inmates at Folsom State Prison.",
      "Owners supplied their own plates from 1905; the state began issuing plates in 1914.",
      "The serial format flipped from 1ABC123 to 123ABC1 in March 2026."
    ],
    designs: "The standard plate is white with the red 'California' name and 'dmv.ca.gov' at the bottom (since 2011)."
  },
  "Colorado": {
    frontPlate: true,
    frontNote: "Colorado requires plates on both the front and rear.",
    trivia: [
      "Colorado's first plates were issued on July 15, 1913.",
      "From 1959 until the early 1990s, serials skipped the letters I, O and Q.",
      "The 1975-76 Centennial plate won collectors' 'Plate of the Year', Colorado's only win."
    ],
    designs: "The standard plate has a mountain range graphic (introduced January 2000); the ABC-D12 serial format dates from 2018."
  },
  "Connecticut": {
    frontPlate: true,
    frontNote: "Connecticut issues plates in pairs for the front and rear.",
    nickname: "Constitution State",
    trivia: [
      "Connecticut began issuing its own plates on September 1, 1905.",
      "Until 2013 the state skipped 0 as a leading digit; since 2015 the AB-12345 format allows it.",
      "The 'Constitution State' slogan first appeared on the 1974 base."
    ],
    designs: "The plate is dark blue on a sky-blue-to-white gradient, with a state-shape graphic top left; the design dates from January 2000."
  },
  "Delaware": {
    frontPlate: false,
    frontNote: "Delaware requires a plate on the rear only (since 1945).",
    trivia: [
      "Plate number 6 sold for $675,000 in 2008; plates 1, 2 and 3 are reserved for the governor, lieutenant governor and secretary of state.",
      "Delaware recycles its serials and uses no leading zeros, so a given number can appear on any plate design.",
      "Owners supplied their own plates until 1909, when Delaware started issuing them."
    ]
  },
  "Florida": {
    frontPlate: false,
    frontNote: "Florida requires a plate on the rear only; truck tractors display only a front plate.",
    trivia: [
      "Florida was the last of the contiguous 48 states to issue its own plates, starting January 1, 1918.",
      "County codes from 1938 to 1977 were ranked by 1935 population; code 1 was Dade County (now Miami-Dade).",
      "Florida serials skip the letter O."
    ],
    designs: "The newest plate (February 2026) is green on white with an orange blossom over a green map of Florida."
  },
  "Georgia": {
    frontPlate: false,
    frontNote: "Georgia requires a plate on the rear only (since 1942).",
    trivia: [
      "The 1941 Georgia plate is described as the first reflectorized passenger plate in the US.",
      "From 1971 to 1975 the first letter of the serial showed the vehicle's weight class.",
      "Georgia sells 'Whiskey Plates' to drivers with restricted privileges after a drunk driving offense."
    ],
    designs: "The standard plate is black on white with a peach in the center (May 2012); a 250th Revolutionary War anniversary plate appeared in January 2026."
  },
  "Hawaii": {
    frontPlate: true,
    frontNote: "Hawaii requires one plate on the front and one on the rear for passenger vehicles (HRS 249-7).",
    trivia: [
      "Kauai County kept homemade plates through 1921, the last US jurisdiction to do so.",
      "The first letters of a Hawaii plate show its county; Hawaii County uses H and Z, Honolulu uses letters like E, F, G and J.",
      "Since 1969, plates have an offset mounting pattern: a round hole top right and slots in the other corners."
    ],
    designs: "The 2025 plate is black on white with a rainbow in the background and 'HAWAIʻI' at the top; it replaced the 'Aloha State' plate that ran from 1991."
  },
  "Idaho": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "Idaho requires a front plate only if the vehicle has a front mounting bracket (since July 1, 2025); ITD still issues two plates.",
    nickname: "Famous Potatoes",
    trivia: [
      "Idaho first issued plates on May 7, 1913.",
      "The 1991 scenic plate won collectors' 'Plate of the Year', Idaho's second win.",
      "Idaho serials use letter codes by county; Canyon County uses a 'P', while most other counties use 'U'."
    ],
    designs: "The standard plate shows a red-sky mountain scene with 'Scenic Idaho' and 'Famous Potatoes'; the design dates from September 1991."
  },
  "Illinois": {
    frontPlate: true,
    frontNote: "Illinois requires plates on both the front and rear.",
    nickname: "Land of Lincoln",
    trivia: [
      "Illinois began issuing plates in 1911; owners had supplied their own since 1907.",
      "A Chicago Tribune critic called the 2017 design 'busy and banal'.",
      "The Lincoln image was lightened within a year of launch and the serial spacing was changed to AB 12345."
    ],
    designs: "The 2017 plate shows Abraham Lincoln against Chicago and Springfield skylines on a blue-to-white gradient with 'Land of Lincoln'."
  },
  "Indiana": {
    frontPlate: false,
    frontNote: "Indiana requires a plate on the rear only (since 1956).",
    trivia: [
      "Indiana first issued state plates on July 1, 1913.",
      "Owners keep the same plate number when they get new plates on a rolling 7-year cycle.",
      "The 1979 Indiana plate won collectors' 'Plate of the Year', the only time the state has won."
    ],
    designs: "The 2017 plate has a country scene with a covered bridge and a dark blue serial."
  },
  "Iowa": {
    frontPlate: true,
    frontNote: "Iowa requires plates on both the front and rear.",
    trivia: [
      "The 1953-55 plates carried 'The Corn State', the first slogan, chosen over 'The Hawkeye State'.",
      "In 2017 voters picked the current design with 113,299 of 291,095 votes.",
      "Iowa began issuing plates in 1911."
    ],
    designs: "The 'City and Country Reboot' plate (April 2018) shows a skyline, farm and wind turbine, with the county name printed on it."
  },
  "Kansas": {
    frontPlate: false,
    frontNote: "Kansas requires a plate on the rear only (since 1956); some vanity plates come in pairs but the front is optional.",
    nickname: "To the Stars",
    trivia: [
      "Kansas first issued plates on July 1, 1913.",
      "The 2024 design was chosen by public vote from five options, after the first proposed redesign got a negative response.",
      "The serial format grew to seven characters (1234ABC) on September 8, 2023."
    ],
    designs: "The August 2024 plate is a light-blue-white-gold gradient with a dark gray state-shaped border, the Capitol and 'To the Stars'."
  },
  "Kentucky": {
    frontPlate: false,
    frontNote: "Kentucky requires a plate on the rear only (since 1944).",
    nickname: "Bluegrass State",
    trivia: [
      "Kentucky's 1927 plate was the first state-issued US passenger plate to show the county name.",
      "Kentucky first issued plates on March 23, 1910.",
      "Serials skip the letters I, O, Q and U."
    ],
    designs: "The September 2020 plate is dark blue on a white-to-light-blue gradient with a Kentucky icon on the left and 'Bluegrass State' above the name."
  },
  "Louisiana": {
    frontPlate: false,
    frontNote: "Louisiana requires a plate on the rear only (since 1952).",
    nickname: "Sportsman's Paradise",
    trivia: [
      "From 1964 to 1993, a letter in the serial showed which State Police troop area issued the plate.",
      "Louisiana's 1944 plate was made from soybean-based fiberboard.",
      "Louisiana first required plates in 1915."
    ],
    designs: "The January 2025 plate shows a map of Louisiana ringed by 18 stars, with the America 250 logo and 'Sportsman's Paradise' on white."
  },
  "Maine": {
    frontPlate: true,
    frontNote: "Maine requires plates on both the front and rear.",
    nickname: "Vacationland",
    trivia: [
      "Maine first issued plates on June 1, 1905.",
      "Plates for 1934 and 1935 were made smaller because of the Great Depression.",
      "Serials skip the letters I and O."
    ],
    designs: "The pine tree plate (May 2025) pays homage to the state flag of 1901-1909: a pine and star in blue and green on white with 'Vacationland'."
  },
  "Maryland": {
    frontPlate: true,
    frontNote: "Maryland requires plates on both the front and rear.",
    trivia: [
      "Maryland began issuing plates on July 1, 1910.",
      "In 1941-44 Maryland revalidated plates with tabs to save wartime metal.",
      "Serials skip the letters I, O, Q and U on regular plates."
    ],
    designs: "The 'Maryland Proud' plate (September 2016) is white with a red state name, black serial and the state flag across the bottom."
  },
  "Massachusetts": {
    frontPlate: true,
    frontNote: "Massachusetts requires you to display both plates the registrar issues (front and rear on the standard plate).",
    nickname: "The Spirit of America",
    trivia: [
      "Massachusetts issued the first US plates on September 1, 1903; plate '1' went to Frederick Tudor and is still in use.",
      "The last character of a serial encodes the expiration month: 1 is January, 0 is October.",
      "The 1928 plate was dropped after a superstition blamed its cod graphic for a bad fishing season."
    ],
    designs: "The 'Spirit' plate has a red serial on white with blue lettering; it debuted in 1987 and became the standard in 1993."
  },
  "Michigan": {
    frontPlate: false,
    frontNote: "Michigan requires a plate on the rear only (since 1981).",
    nickname: "Pure Michigan",
    trivia: [
      "Michigan has required plates to be replaced every ten years since 2015.",
      "Serials have skipped I and O since 1983.",
      "Michigan began issuing plates in 1910."
    ],
    designs: "The April 2013 plate is white with a blue wavy band at the bottom, the Pure Michigan logo and 'michigan.org'."
  },
  "Minnesota": {
    frontPlate: true,
    frontNote: "Minnesota requires plates on both the front and rear.",
    nickname: "10,000 Lakes",
    trivia: [
      "Minnesota first issued plates on May 15, 1909.",
      "Plates must be replaced every seven years, a rule since 1989, because the reflective sheeting wears out.",
      "'Whiskey plates' start with W; only Minnesota and Ohio issue them for post-DUI cases."
    ]
  },
  "Mississippi": {
    frontPlate: false,
    frontNote: "Mississippi requires a plate on the rear only (since 1925).",
    trivia: [
      "Only two examples of the 1913 Mississippi plate are known, making it one of the rarest in the US.",
      "The first state-issued plate dates to June 1, 1912.",
      "The 1976-81 graphic plate won collectors' 'Plate of the Year' for 1977."
    ],
    designs: "The 2024 plate has dark blue lettering on white with a magnolia blossom on a blue circle; it was designed by Leah Eaton of Starkville."
  },
  "Missouri": {
    frontPlate: true,
    frontNote: "Missouri requires front and rear plates, except trucks over 12,000 pounds, which display only a front plate.",
    nickname: "Show-Me State",
    trivia: [
      "Missouri's first state-issued plates date to March 9, 1911.",
      "Missouri made fiberboard plates in WWII and revalidated 1943 plates with green tabs.",
      "Missouri plates are made at the Jefferson City Correctional Center."
    ],
    designs: "The current plate (November 2024) has 'Show-Me State' at the top; the previous 2018 Bicentennial plate was dark blue on white with the state seal."
  },
  "Montana": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "Montana requires front and rear plates; a Highway Patrol waiver is available if no front bracket exists for the vehicle.",
    nickname: "Treasure State",
    trivia: [
      "The 1913-14 front plates were perforated to let air reach the radiator.",
      "County codes (1934) were ordered by 1930 population; Silver Bow County (Butte) is number 1.",
      "The 1944 plate was fiberboard made with soybeans."
    ],
    designs: "The 2010 plate is white on blue with a state-shaped border, 'Treasure State' and a buffalo skull separator."
  },
  "Nebraska": {
    frontPlate: true,
    frontNote: "Nebraska requires two plates for now; LB 97 (2025) moves to one plate from the 2029 plate cycle.",
    trivia: [
      "Douglas, Lancaster and Sarpy counties use uncoded serials; other counties begin with a county number, like 3-A1234.",
      "Nebraska required registration in 1905 but did not issue plates until 1915.",
      "The 2022 county-coded plates swapped the state-shaped separator for a dash."
    ],
    designs: "The January 2023 plate is dark blue on white with the Capitol's 'Genius of Creative Energy' mosaic in the background."
  },
  "Nevada": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "Nevada requires two plates unless the vehicle was not designed for a front plate and no bracket was provided (NV DMV).",
    nickname: "Home Means Nevada",
    trivia: [
      "Nevada's plates were made at Nevada State Prison from 1928 to 2012, then at Northern Nevada Correctional Center.",
      "The 1985 sheep plate won collectors' 'Plate of the Year', the only time Nevada has.",
      "State-issued plates began January 1, 1916."
    ],
    designs: "The sky-blue 'Home Means Nevada' design (November 2016) shows a stylized mountain range along the bottom."
  },
  "New Hampshire": {
    frontPlate: true,
    frontNote: "New Hampshire requires plates on both the front and rear.",
    nickname: "Live Free or Die",
    trivia: [
      "George Maynard taped over the motto and served 15 days for refusing a $75 fine, leading to the 1977 Wooley v. Maynard ruling.",
      "New Hampshire issued its first plate on April 4, 1905.",
      "On the 1999 base, serials ran backward."
    ],
    designs: "The 1999 plate shows the Old Man of the Mountain and Cannon Mountain on a pale blue sky with 'Live Free or Die' in green."
  },
  "New Jersey": {
    frontPlate: true,
    frontNote: "New Jersey requires plates on both the front and rear.",
    nickname: "Garden State",
    trivia: [
      "Every New Jersey passenger plate since 1959 is still valid if the car has been continuously registered.",
      "New Jersey serials skip I, O and Q.",
      "New Jersey began issuing plates in 1908; owners supplied their own before that."
    ],
    designs: "The design (late 1992) is black on a yellow-to-white gradient with 'Garden State'; the screened serial arrived in April 2014."
  },
  "New Mexico": {
    frontPlate: false,
    frontNote: "New Mexico requires a plate on the rear only (since 1961).",
    nickname: "Land of Enchantment",
    trivia: [
      "New Mexico is the only state that prints 'USA' on its plates, to avoid confusion with neighboring Mexico.",
      "From 1947 to 1974 plates carried county codes; Santa Fe County was number 1.",
      "New Mexico issued its first plates on June 8, 1912."
    ],
    designs: "The yucca plate (1991) has a red serial on yellow, a light blue yucca and Native American zigzag bands at the top."
  },
  "New York": {
    frontPlate: true,
    frontNote: "New York requires plates on both the front and rear.",
    nickname: "Excelsior",
    trivia: [
      "New York required registration first, in 1901, but state-issued plates only began August 1, 1910.",
      "The first batches of the 2020 Excelsior plate (KAA-KCH) were too reflective for toll cameras and never went out.",
      "Excelsior serials began at KAA-1000."
    ],
    designs: "The June 2020 Excelsior plate shows Niagara Falls and the New York City skyline under a gold 'Excelsior' motto on white."
  },
  "North Carolina": {
    frontPlate: false,
    frontNote: "North Carolina requires a plate on the rear only (since 1956).",
    nickname: "First in Flight",
    trivia: [
      "The 1982 'First in Flight' plate won collectors' 'Plate of the Year', the only win for North Carolina.",
      "North Carolina began issuing state plates on April 1, 1913, after county plates from 1907.",
      "The second letter of standard serials only runs from A to M."
    ],
    designs: "The standard plate is blue on reflective white with a light-blue Wright Flyer and 'First in Flight' (standard issue from December 2010)."
  },
  "North Dakota": {
    frontPlate: true,
    frontNote: "North Dakota requires plates on both the front and rear.",
    nickname: "Legendary",
    trivia: [
      "The 1956 plate was the state's first 6-by-12-inch plate and the first with 'Peace Garden State'.",
      "The 1984-88 Theodore Roosevelt plate won 1985 'Plate of the Year', sharing it with Nevada.",
      "North Dakota first required plates in 1911."
    ],
    designs: "The 'Legendary' plate (November 2015) shows a badlands sunrise with a bison and wheat stalks, plus 'Peace Garden State'."
  },
  "Ohio": {
    frontPlate: false,
    frontNote: "Ohio requires a plate on the rear only (since July 1, 2020); commercial tractors need a front plate.",
    nickname: "Birthplace of Aviation",
    trivia: [
      "The first 2021 design showed the Wright Flyer flying backward; about 35,000 plates were made before the error was caught.",
      "Ohio's state plates began in 1908 under the Ward Law.",
      "Like Minnesota, Ohio issues 'whiskey plates' to certain DUI offenders."
    ],
    designs: "The 'Sunrise in Ohio' plate (December 2021) has a red banner, a Wright Flyer, a child on a tree swing and 'Birthplace of Aviation'."
  },
  "Oklahoma": {
    frontPlate: false,
    frontNote: "Oklahoma requires a plate on the rear only (since 1944).",
    nickname: "Imagine That",
    trivia: [
      "Oklahoma's first plates were issued on July 1, 1915.",
      "Before July 1, 2019, plates belonged to the car; now they belong to the owner and can be transferred.",
      "Serials use an ABC-123 format."
    ],
    designs: "The September 2024 plate is white on red with small blue images along the bottom and 'Imagine That'."
  },
  "Oregon": {
    frontPlate: true,
    frontNote: "Oregon requires plates on both the front and rear.",
    trivia: [
      "Oregon plates in 1946 were issued as rears only, and owners showed a windshield sticker in front.",
      "In 2004 the serial changed to numbers first (123 ABC), skipping A-series, I and O to avoid confusion.",
      "Oregon began issuing plates on August 1, 1911."
    ],
    designs: "The standard plate (November 1989) has a dark green Douglas fir over lavender mountains and a light blue sky."
  },
  "Pennsylvania": {
    frontPlate: false,
    frontNote: "Pennsylvania requires a plate on the rear only (since 1952); state-owned passenger vehicles and press photographers' cars need a front plate.",
    nickname: "Let Freedom Ring",
    trivia: [
      "Pennsylvania's first plates were issued in 1906; from 1903 to 1905 owners supplied their own.",
      "The 2025 base debuted slashed zeros.",
      "Press photographers' vehicles are required to display a front plate."
    ],
    designs: "The May 2025 plate has a Liberty Bell on cream with red 'Pennsylvania' and 'Let Freedom Ring'."
  },
  "Puerto Rico": {
    nickname: "Island of Enchantment",
    designs: "The USA 250 plate shows the flag fading into a harbour fortress scene, with the island's outline in the middle and '1776 USA 250 2026' along the bottom."
  },
  "Rhode Island": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "Rhode Island requires two plates, but vehicles without a factory front bracket may show only the rear plate (new 2026 law).",
    nickname: "Ocean State",
    trivia: [
      "Rhode Island first required plates in 1904.",
      "Politicians have long handed out low-numbered plates to supporters, making them status symbols.",
      "The first plates in 1904-08 were four-digit all-number serials."
    ],
    designs: "The 2023 plate is navy on light blue with a five-wave design, an anchor and 'Ocean State'."
  },
  "South Carolina": {
    frontPlate: false,
    frontNote: "South Carolina requires a plate on the rear only (since 1975).",
    nickname: "Where the Revolutionary War Was Won",
    trivia: [
      "South Carolina's first plates in 1917 were embossed black on light yellow.",
      "From 1972 to 1975 each three-letter series only ran numbers 101 to 250.",
      "The 1990 plate won collectors' 'Plate of the Year', the only time for the state."
    ],
    designs: "The January 2026 plate carries the slogan 'Where the Revolutionary War Was Won'."
  },
  "South Dakota": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "South Dakota requires front and rear plates, except rear-only plates are available for vehicles driven under 7,500 miles a year (SD DOR).",
    nickname: "Great Faces. Great Places.",
    trivia: [
      "South Dakota's 1974 plate was the first screened-graphic license plate in the US.",
      "South Dakota issued its first plates in 1913, after owners supplied their own from 1905.",
      "Serials skip I, O and Q."
    ],
    designs: "The January 2023 plate is a full-color Mount Rushmore scene on a blue sky with 'Great Faces. Great Places.'"
  },
  "Tennessee": {
    frontPlate: false,
    frontNote: "Tennessee requires a plate on the rear only (since 1977).",
    nickname: "The Volunteer State",
    trivia: [
      "From 1939 to 1988 Tennessee plates began with a county code number assigned by population.",
      "The 1957 plate was the first 6-by-12-inch plate, after about 21 years of plates shaped like the state.",
      "Tennessee issued its first plates on July 1, 1915."
    ],
    designs: "The January 2022 plate (revised November 2023) is blue with a white serial, 'Tennessee' inside a state outline and 'The Volunteer State'."
  },
  "Texas": {
    frontPlate: true,
    frontNote: "Texas requires plates on both the front and rear.",
    nickname: "The Lone Star State",
    trivia: [
      "Texas serials leave out vowels and Q.",
      "Texas issued its first state plates on July 1, 1917; counties assigned serials before then.",
      "The 'Texas Classic' standard plate is black lettering on white and has been issued since July 2012."
    ],
    designs: "The standard 'Texas Classic' plate is black on white with 'The Lone Star State'."
  },
  "Utah": {
    frontPlate: false,
    frontNote: "Utah requires a plate on the rear only since January 1, 2025.",
    nickname: "Life Elevated",
    trivia: [
      "On the Arch plate the first serial letter runs backward: Z, Y, X, and so on.",
      "For 2025, Utah began reissuing serials from the 2007-2023 runs for the first time.",
      "Utah plates were first issued in 1915."
    ],
    designs: "The Ski plate ('Greatest Snow on Earth') and the Delicate Arch plate ('Life Elevated') are dark blue on white (since November 2007)."
  },
  "Vermont": {
    frontPlate: true,
    frontNote: "Vermont requires plates on both the front and rear.",
    nickname: "Green Mountain State",
    trivia: [
      "Vermont's first plates were issued on May 1, 1905.",
      "Serials skip I, J, O, Q and U; V and Z returned in January 2024.",
      "Vermont's kelly green dates from 1967-68."
    ],
    designs: "The standard plate (January 1990) is green and white with 'Green Mountain State'."
  },
  "Virginia": {
    frontPlate: true,
    frontNote: "Virginia requires plates on both the front and rear.",
    nickname: "Virginia Is for Lovers",
    trivia: [
      "Virginia's first plates were issued in June 1906.",
      "Personalized plates cost only $10 more than random ones, which helps explain Virginia's huge vanity plate count.",
      "Serials ran forward through V and then backward through U, T and S."
    ],
    designs: "The 2014 plate replaced the second 'V' in 'Virginia is for Lovers' with a red heart."
  },
  "Washington": {
    frontPlate: true,
    frontNote: "Washington requires plates on both the front and rear.",
    nickname: "Evergreen State",
    trivia: [
      "Washington's plates have been made by incarcerated workers since 1923, mainly at the Walla Walla penitentiary.",
      "State-issued plates began June 10, 1915.",
      "The third letter of a serial cannot be I, O or Q."
    ],
    designs: "The un-embossed navy-lettered plate arrived in October 2024; 'Evergreen State' marks the series."
  },
  "West Virginia": {
    frontPlate: false,
    frontNote: "West Virginia requires a plate on the rear only (since 1944).",
    nickname: "Wild, Wonderful",
    trivia: [
      "The first serial character shows the expiration month: 1-9 for January-September and O, N, D for October-December.",
      "Fewer than five examples of the 1906 plate are known.",
      "West Virginia issued its first plates on May 1, 1905."
    ],
    designs: "The July 2023 plate is white with a dark blue top bar, gold 'West Virginia' lettering and a state-outline separator."
  },
  "Wisconsin": {
    frontPlate: true,
    frontNote: "Wisconsin requires plates on both the front and rear.",
    nickname: "America's Dairyland",
    trivia: [
      "Since May 2024, electric and hybrid owners must show an orange 'EV HYBRID' sticker on the plates.",
      "Wisconsin plates have skipped I, O and Q since 1986-87.",
      "Wisconsin first required plates on July 1, 1905."
    ],
    designs: "The April 2017 plate keeps the 'America's Dairyland' slogan and uses an ABC-1234 serial."
  },
  "Wyoming": {
    frontAmbiguous: true, // conditional rule: left out of Yes/No front-plate questions
    frontPlate: true,
    frontNote: "Wyoming requires front and rear plates, except vehicles made without a front plate bracket and custom or antique vehicles, which can display the rear only.",
    nickname: "That's WY",
    trivia: [
      "The Bucking Horse and Rider has appeared on Wyoming plates since 1936.",
      "The 1944 plate was soybean-based fiberboard, to save metal in wartime.",
      "Wyoming first required plates in 1913."
    ],
    designs: "The June 2024 plate is navy and gray with the bucking horse over the state flag and 'travelwyoming.com'."
  }
};
