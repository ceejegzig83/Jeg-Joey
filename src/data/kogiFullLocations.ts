import { LocationPoint } from '../types';

export interface KogiWard {
  name: string;
  lga: string;
  streets: string[];
}

export interface KogiLGAInfo {
  name: string;
  zone: 'Central' | 'West' | 'East';
  headquarters: string;
  latitude: number;
  longitude: number;
  wards: string[];
}

export const KOGI_LGAS_METADATA: KogiLGAInfo[] = [
  // Kogi Central (Ebiraland - Hub Core)
  {
    name: 'Okene',
    zone: 'Central',
    headquarters: 'Okene',
    latitude: 7.5501,
    longitude: 6.2359,
    wards: [
      'Bariki',
      'Otutu',
      'Onyukoko',
      'Lafia / Obessa',
      'Iruvucheba',
      'Agassa / Ahache',
      'Upogoro / Odenku',
      'Obehira Eba',
      'Obehira Uvete',
      'Abuga / Ozuja',
      'Idare'
    ]
  },
  {
    name: 'Adavi',
    zone: 'Central',
    headquarters: 'Ogaminana',
    latitude: 7.5920,
    longitude: 6.2710,
    wards: [
      'Ogaminana Central',
      'Nagazi',
      'Kuroko I',
      'Kuroko II',
      'Inoziomi / Inozi',
      'Eika-Ohizenyi',
      'Idanuhua',
      'Aduvao',
      'Pekoko',
      'Isuao'
    ]
  },
  {
    name: 'Okehi',
    zone: 'Central',
    headquarters: 'Obangede',
    latitude: 7.6400,
    longitude: 6.2100,
    wards: [
      'Obangede',
      'Itakpe',
      'Ihima (Oha)',
      'Ihima (Ikuehi)',
      'Oboroke',
      'Eika',
      'Uboro',
      'Okengwe',
      'Ohuepe',
      'Omavi'
    ]
  },
  {
    name: 'Ajaokuta',
    zone: 'Central',
    headquarters: 'Eganyi',
    latitude: 7.5620,
    longitude: 6.6550,
    wards: [
      'Ajaokuta Native Town',
      'Steel Complex Housing Estate',
      'Geregu Power Station Ward',
      'Eganyi',
      'Badoko',
      'Adogo',
      'Upake',
      'Abodoh'
    ]
  },
  {
    name: 'Ogori/Magongo',
    zone: 'Central',
    headquarters: 'Akpafa',
    latitude: 7.4200,
    longitude: 6.1950,
    wards: [
      'Ogori Central',
      'Oshobane',
      'Magongo Central',
      'Akpafa',
      'Aiyeromi',
      'Eni'
    ]
  },

  // Kogi West
  {
    name: 'Lokoja',
    zone: 'West',
    headquarters: 'Lokoja (State Capital)',
    latitude: 7.8023,
    longitude: 6.7430,
    wards: [
      'Ward A (Central / Post Office)',
      'Ward B (Adankolo / Marine)',
      'Ward C (Ganaja / Phase 1 & 2)',
      'Ward D (Felele / Poly Gate)',
      'Ward E (Sarkin Noma / Crusher)',
      'Kogi Poly Campus Ward',
      'Kotonkarfe Boundary / Kpata'
    ]
  },
  {
    name: 'Kogi (Koton Karfe)',
    zone: 'West',
    headquarters: 'Koton Karfe',
    latitude: 8.0980,
    longitude: 6.7950,
    wards: [
      'Koton Karfe Central',
      'Gegu Beki',
      'Girinya',
      'Akpogu',
      'Chikara',
      'Iraki'
    ]
  },
  {
    name: 'Kabba/Bunu',
    zone: 'West',
    headquarters: 'Kabba',
    latitude: 7.8280,
    longitude: 6.0750,
    wards: [
      'Kabba Central (Oba Palace)',
      'Odo-Ape',
      'Iluke',
      'Ayetoro Gbede',
      'Oke-Bukun',
      'Asuta',
      'Akutupa',
      'Olle'
    ]
  },
  {
    name: 'Ijumu',
    zone: 'West',
    headquarters: 'Iyara',
    latitude: 7.8460,
    longitude: 5.9200,
    wards: [
      'Iyara Central',
      'Iyah-Gbede',
      'Ogidi',
      'Ayere',
      'Iyamoye',
      'Egbeda Egga'
    ]
  },
  {
    name: 'Yagba West',
    zone: 'West',
    headquarters: 'Odo-Ere',
    latitude: 8.2300,
    longitude: 5.5200,
    wards: [
      'Odo-Ere Central',
      'Egbe Township',
      'Odo-Eri',
      'Okeri',
      'Ogbe',
      'Ejiba'
    ]
  },
  {
    name: 'Yagba East',
    zone: 'West',
    headquarters: 'Isanlu',
    latitude: 8.2800,
    longitude: 5.8300,
    wards: [
      'Isanlu Central',
      'Ponyan',
      'Ife-Olukotun',
      'Alu',
      'Ejuku',
      'Jege'
    ]
  },
  {
    name: 'Mopa-Muro',
    zone: 'West',
    headquarters: 'Mopa',
    latitude: 7.9600,
    longitude: 5.9000,
    wards: [
      'Mopa Township',
      'Takete Ide',
      'Effo Amuro',
      'Orokere Amuro',
      'Ahabe'
    ]
  },

  // Kogi East
  {
    name: 'Dekina',
    zone: 'East',
    headquarters: 'Dekina',
    latitude: 7.4950,
    longitude: 7.1820,
    wards: [
      'Anyigba (PAAU University City)',
      'Dekina Central',
      'Abocho',
      'Egume',
      'Iyale',
      'Odu',
      'Ochaja'
    ]
  },
  {
    name: 'Ankpa',
    zone: 'East',
    headquarters: 'Ankpa',
    latitude: 7.6320,
    longitude: 7.6310,
    wards: [
      'Ankpa Town (Central)',
      'Enjema',
      'Ojoku',
      'Ankpa Suburb',
      'Biraidu',
      'Ogodo'
    ]
  },
  {
    name: 'Idah',
    zone: 'East',
    headquarters: 'Idah',
    latitude: 7.1120,
    longitude: 6.7410,
    wards: [
      'Idah Waterfront & Port',
      'Attah of Igala Palace Ward',
      'Federal Polytechnic Idah Gate',
      'Ede Ward',
      'Sabon Gari Idah',
      'Ogegele'
    ]
  },
  {
    name: 'Bassa',
    zone: 'East',
    headquarters: 'Oguma',
    latitude: 7.7400,
    longitude: 6.9500,
    wards: [
      'Oguma Central',
      'Gboloko',
      'Bassa-Nge',
      'Akpacha',
      'Kpata Bassa',
      'Mozum'
    ]
  },
  {
    name: 'Ibaji',
    zone: 'East',
    headquarters: 'Onyedega',
    latitude: 6.9100,
    longitude: 6.8200,
    wards: [
      'Onyedega Central',
      'Odeke',
      'Ejule Ojebe',
      'Unale',
      'Ayeke',
      'Ujeh'
    ]
  },
  {
    name: 'Igalamela-Odolu',
    zone: 'East',
    headquarters: 'Ajaka',
    latitude: 7.0200,
    longitude: 6.9500,
    wards: [
      'Ajaka Ward 1',
      'Ajaka Ward 2',
      'Odolu Central',
      'Avrugo',
      'Akpanya',
      'Oforachi'
    ]
  },
  {
    name: 'Ofu',
    zone: 'East',
    headquarters: 'Ugwolawo',
    latitude: 7.3300,
    longitude: 6.9400,
    wards: [
      'Ugwolawo Central',
      'Itobe Bridge & River Port',
      'Aloji',
      'Ochadamu',
      'Igo',
      'Ejule'
    ]
  },
  {
    name: 'Olamaboro',
    zone: 'East',
    headquarters: 'Okpo',
    latitude: 7.2300,
    longitude: 7.4200,
    wards: [
      'Okpo Central',
      'Imane Ward 1',
      'Imane Ward 2',
      'Ogugu Ward 1',
      'Ogugu Ward 2',
      'Invele'
    ]
  },
  {
    name: 'Omala',
    zone: 'East',
    headquarters: 'Abejukolo',
    latitude: 7.7100,
    longitude: 7.5300,
    wards: [
      'Abejukolo Central',
      'Bagana River Port',
      'Ogodu',
      'Icheke',
      'Akpacha',
      'Oji'
    ]
  }
];

// Rich, detailed list of every Street, Junction, Ward, and Landmark across Kogi State
export const ALL_KOGI_STREET_LOCATIONS: LocationPoint[] = [
  // ==========================================
  // 1. OKENE LGA (Central Hub of Flourish Destiny)
  // ==========================================
  {
    name: 'Flourish Destiny Hub (Total Junction, Okene)',
    address: 'Plot 4, Inoziomi Road, Total Junction, Okene',
    area: 'Total Junction Commercial District',
    lga: 'Okene',
    ward: 'Bariki',
    street: 'Inoziomi Road / Total Junction Bypass',
    isWithinKogi: true,
    latitude: 7.5501,
    longitude: 6.2359
  },
  {
    name: 'Okene Central Market (Obehira Gate)',
    address: 'Market Main Gate, Obehira Road, Okene',
    area: 'Obehira Market',
    lga: 'Okene',
    ward: 'Obehira Eba',
    street: 'Obehira Market Road',
    isWithinKogi: true,
    latitude: 7.5420,
    longitude: 6.2280
  },
  {
    name: 'Bariki Main Roundabout & Central Mosque',
    address: 'Palace Road, Bariki, Okene',
    area: 'Bariki Central',
    lga: 'Okene',
    ward: 'Bariki',
    street: 'Ohinoyi Palace Way / Central Mosque Road',
    isWithinKogi: true,
    latitude: 7.5518,
    longitude: 6.2395
  },
  {
    name: 'Otutu Quarters Junction',
    address: 'Otutu Street, Okene',
    area: 'Otutu',
    lga: 'Okene',
    ward: 'Otutu',
    street: 'Otutu Hospital Road',
    isWithinKogi: true,
    latitude: 7.5562,
    longitude: 6.2330
  },
  {
    name: 'Onyukoko Market Junction',
    address: 'Onyukoko High Street, Okene',
    area: 'Onyukoko',
    lga: 'Okene',
    ward: 'Onyukoko',
    street: 'Commercial Bank Way, Onyukoko',
    isWithinKogi: true,
    latitude: 7.5480,
    longitude: 6.2415
  },
  {
    name: 'Lafia Hospital Junction / Obessa',
    address: 'Lafia Specialist Hospital Road, Obessa, Okene',
    area: 'Lafia / Obessa',
    lga: 'Okene',
    ward: 'Lafia / Obessa',
    street: 'Lafia Hospital Road',
    isWithinKogi: true,
    latitude: 7.5390,
    longitude: 6.2340
  },
  {
    name: 'Federal College of Education (FCE) Okene Campus Gate',
    address: 'FCE Main Gate, Otite, Okene',
    area: 'Otite / FCE',
    lga: 'Okene',
    ward: 'Upogoro / Odenku',
    street: 'FCE College Road, Otite',
    isWithinKogi: true,
    latitude: 7.5310,
    longitude: 6.2490
  },
  {
    name: 'Agassa Junction / Ebira Civic Center',
    address: 'Agassa Express Way, Okene',
    area: 'Agassa',
    lga: 'Okene',
    ward: 'Agassa / Ahache',
    street: 'Agassa High Street',
    isWithinKogi: true,
    latitude: 7.5610,
    longitude: 6.2510
  },
  {
    name: 'Iruvucheba Community Junction',
    address: 'Iruvucheba Hill View Street, Okene',
    area: 'Iruvucheba',
    lga: 'Okene',
    ward: 'Iruvucheba',
    street: 'Iruvucheba Link Road',
    isWithinKogi: true,
    latitude: 7.5450,
    longitude: 6.2480
  },
  {
    name: 'Ahache Police Barracks & Market',
    address: 'Ahache Road, Okene',
    area: 'Ahache',
    lga: 'Okene',
    ward: 'Agassa / Ahache',
    street: 'Old Checkpoint Avenue, Ahache',
    isWithinKogi: true,
    latitude: 7.5650,
    longitude: 6.2540
  },
  {
    name: 'Upogoro Town Hall',
    address: 'Upogoro Central Way, Okene',
    area: 'Upogoro',
    lga: 'Okene',
    ward: 'Upogoro / Odenku',
    street: 'Upogoro Market Street',
    isWithinKogi: true,
    latitude: 7.5260,
    longitude: 6.2580
  },
  {
    name: 'Idare Rock View Junction',
    address: 'Idare Heights, Okene',
    area: 'Idare',
    lga: 'Okene',
    ward: 'Idare',
    street: 'Idare Rock View Road',
    isWithinKogi: true,
    latitude: 7.5580,
    longitude: 6.2290
  },

  // ==========================================
  // 2. ADAVI LGA
  // ==========================================
  {
    name: 'Adavi LGA Secretariat / Ogaminana Roundabout',
    address: 'Ogaminana Roundabout, Adavi LGA',
    area: 'Ogaminana Central',
    lga: 'Adavi',
    ward: 'Ogaminana Central',
    street: 'Lokoja-Okene Federal Highway, Ogaminana',
    isWithinKogi: true,
    latitude: 7.5920,
    longitude: 6.2710
  },
  {
    name: 'Nagazi Eika Express Junction',
    address: 'Nagazi Express, Adavi',
    area: 'Nagazi',
    lga: 'Adavi',
    ward: 'Nagazi',
    street: 'Nagazi Main Commercial Street',
    isWithinKogi: true,
    latitude: 7.5850,
    longitude: 6.2620
  },
  {
    name: 'Kuroko Township Gate',
    address: 'Kuroko Main Way, Adavi',
    area: 'Kuroko',
    lga: 'Adavi',
    ward: 'Kuroko I',
    street: 'Kuroko Weaving Cooperative Road',
    isWithinKogi: true,
    latitude: 7.5680,
    longitude: 6.2410
  },
  {
    name: 'Eika-Ohizenyi Market Center',
    address: 'Eika Market Square, Adavi',
    area: 'Eika',
    lga: 'Adavi',
    ward: 'Eika-Ohizenyi',
    street: 'Eika Town Hall Road',
    isWithinKogi: true,
    latitude: 7.6040,
    longitude: 6.2890
  },
  {
    name: 'Idanuhua Village Junction',
    address: 'Idanuhua Route, Adavi',
    area: 'Idanuhua',
    lga: 'Adavi',
    ward: 'Idanuhua',
    street: 'Idanuhua Feeder Road',
    isWithinKogi: true,
    latitude: 7.5750,
    longitude: 6.2800
  },

  // ==========================================
  // 3. OKEHI LGA
  // ==========================================
  {
    name: 'Okehi LGA Secretariat (Obangede)',
    address: 'Obangede Central Roundabout, Okehi',
    area: 'Obangede',
    lga: 'Okehi',
    ward: 'Obangede',
    street: 'Hospital Road, Obangede Specialist Hospital',
    isWithinKogi: true,
    latitude: 7.6400,
    longitude: 6.2100
  },
  {
    name: 'Itakpe Iron Ore Complex (NIOMCO Gate)',
    address: 'NIOMCO Residential Camp Gate, Itakpe',
    area: 'Itakpe',
    lga: 'Okehi',
    ward: 'Itakpe',
    street: 'Itakpe Rail Station Road',
    isWithinKogi: true,
    latitude: 7.6100,
    longitude: 6.3150
  },
  {
    name: 'Ihima Central (Oha / Ikuehi Junction)',
    address: 'Ikuehi Square, Ihima, Okehi',
    area: 'Ihima',
    lga: 'Okehi',
    ward: 'Ihima (Ikuehi)',
    street: 'Ihima High Street',
    isWithinKogi: true,
    latitude: 7.5720,
    longitude: 6.1820
  },
  {
    name: 'Oboroke Community Center',
    address: 'Oboroke Market Road, Okehi',
    area: 'Oboroke',
    lga: 'Okehi',
    ward: 'Oboroke',
    street: 'Oboroke Main Way',
    isWithinKogi: true,
    latitude: 7.5810,
    longitude: 6.1690
  },

  // ==========================================
  // 4. AJAOKUTA LGA
  // ==========================================
  {
    name: 'Ajaokuta Steel Plant (Main Ingress Gate)',
    address: 'Steel Complex Highway, Ajaokuta',
    area: 'Steel Complex',
    lga: 'Ajaokuta',
    ward: 'Steel Complex Housing Estate',
    street: 'Metallurgical Way, Ajaokuta Steel City',
    isWithinKogi: true,
    latitude: 7.5620,
    longitude: 6.6550
  },
  {
    name: 'Geregu Thermal Power Plant Road',
    address: 'Geregu Village Junction, Ajaokuta',
    area: 'Geregu',
    lga: 'Ajaokuta',
    ward: 'Geregu Power Station Ward',
    street: 'Geregu Power Station Access Road',
    isWithinKogi: true,
    latitude: 7.5410,
    longitude: 6.7020
  },
  {
    name: 'Ajaokuta Native Town & River Niger Beach',
    address: 'River Niger Waterfront, Ajaokuta',
    area: 'Ajaokuta Native Town',
    lga: 'Ajaokuta',
    ward: 'Ajaokuta Native Town',
    street: 'Old Port Road, Ajaokuta',
    isWithinKogi: true,
    latitude: 7.5780,
    longitude: 6.6890
  },
  {
    name: 'Adogo Market Junction',
    address: 'Adogo Township Road, Ajaokuta',
    area: 'Adogo',
    lga: 'Ajaokuta',
    ward: 'Adogo',
    street: 'Adogo-Okene Link Road',
    isWithinKogi: true,
    latitude: 7.5120,
    longitude: 6.5400
  },

  // ==========================================
  // 5. OGORI/MAGONGO LGA
  // ==========================================
  {
    name: 'Ogori Town Hall & Ovia-Osese Festival Square',
    address: 'Ovia-Osese Festival Ground, Ogori',
    area: 'Ogori Central',
    lga: 'Ogori/Magongo',
    ward: 'Ogori Central',
    street: 'Ogori Palace Way',
    isWithinKogi: true,
    latitude: 7.4200,
    longitude: 6.1950
  },
  {
    name: 'Magongo Township Roundabout',
    address: 'Magongo Main Road, Magongo',
    area: 'Magongo',
    lga: 'Ogori/Magongo',
    ward: 'Magongo Central',
    street: 'Magongo Boundary Avenue',
    isWithinKogi: true,
    latitude: 7.4050,
    longitude: 6.1820
  },

  // ==========================================
  // 6. LOKOJA LGA (State Capital)
  // ==========================================
  {
    name: 'Lokoja Post Office / Muritala Mohammed Way',
    address: 'Muritala Mohammed Way, Lokoja',
    area: 'Lokoja Central',
    lga: 'Lokoja',
    ward: 'Ward A (Central / Post Office)',
    street: 'Muritala Mohammed Way',
    isWithinKogi: true,
    latitude: 7.8023,
    longitude: 6.7430
  },
  {
    name: 'Ganaja Junction & Flyover Interchange',
    address: 'Ganaja Road, Lokoja',
    area: 'Ganaja',
    lga: 'Lokoja',
    ward: 'Ward C (Ganaja / Phase 1 & 2)',
    street: 'Ganaja Express Way',
    isWithinKogi: true,
    latitude: 7.7980,
    longitude: 6.7410
  },
  {
    name: 'Federal University Lokoja (FUL) Adankolo Campus Gate',
    address: 'Adankolo New Layout, Lokoja',
    area: 'Adankolo',
    lga: 'Lokoja',
    ward: 'Ward B (Adankolo / Marine)',
    street: 'University Road, Adankolo',
    isWithinKogi: true,
    latitude: 7.8100,
    longitude: 6.7350
  },
  {
    name: 'Kogi State Polytechnic Main Gate (Felele)',
    address: 'Felele Express, Lokoja',
    area: 'Felele',
    lga: 'Lokoja',
    ward: 'Ward D (Felele / Poly Gate)',
    street: 'Abuja-Lokoja Dual Carriageway, Felele',
    isWithinKogi: true,
    latitude: 7.8420,
    longitude: 6.7210
  },
  {
    name: 'Sarkin Noma / Crusher Market',
    address: 'Crusher Zone, Lokoja',
    area: 'Sarkin Noma',
    lga: 'Lokoja',
    ward: 'Ward E (Sarkin Noma / Crusher)',
    street: 'Crusher Bypass, Sarkin Noma',
    isWithinKogi: true,
    latitude: 7.8280,
    longitude: 6.7110
  },
  {
    name: 'Confluence Beach Hotel & River Niger/Benue Point',
    address: 'Confluence Point View Road, Lokoja',
    area: 'Marine Road',
    lga: 'Lokoja',
    ward: 'Ward B (Adankolo / Marine)',
    street: 'Marine Road / Confluence Quay',
    isWithinKogi: true,
    latitude: 7.7910,
    longitude: 6.7550
  },

  // ==========================================
  // 7. KOGI (KOTON KARFE) LGA
  // ==========================================
  {
    name: 'Koton Karfe Palace & Central Market',
    address: 'Abuja-Lokoja Highway, Koton Karfe',
    area: 'Koton Karfe Central',
    lga: 'Kogi (Koton Karfe)',
    ward: 'Koton Karfe Central',
    street: 'Ohimegye Palace Road',
    isWithinKogi: true,
    latitude: 8.0980,
    longitude: 6.7950
  },
  {
    name: 'Gegu Beki Transit Junction',
    address: 'Gegu Beki Town, Kogi LGA',
    area: 'Gegu Beki',
    lga: 'Kogi (Koton Karfe)',
    ward: 'Gegu Beki',
    street: 'Gegu Beki Market Road',
    isWithinKogi: true,
    latitude: 8.2100,
    longitude: 6.8400
  },

  // ==========================================
  // 8. KABBA/BUNU LGA
  // ==========================================
  {
    name: 'Obaro of Kabba Palace & Central Roundabout',
    address: 'Obaro Way, Kabba Town Center',
    area: 'Kabba Central',
    lga: 'Kabba/Bunu',
    ward: 'Kabba Central (Oba Palace)',
    street: 'Obaro Palace Way',
    isWithinKogi: true,
    latitude: 7.8280,
    longitude: 6.0750
  },
  {
    name: 'College of Agriculture (DAC/ABU) Kabba Gate',
    address: 'DAC Campus Gate, Kabba',
    area: 'Kabba North',
    lga: 'Kabba/Bunu',
    ward: 'Oke-Bukun',
    street: 'College Road, Kabba',
    isWithinKogi: true,
    latitude: 7.8390,
    longitude: 6.0680
  },
  {
    name: 'Ayetoro Gbede Market Square',
    address: 'Ayetoro Gbede Main Road, Kabba/Bunu',
    area: 'Ayetoro Gbede',
    lga: 'Kabba/Bunu',
    ward: 'Ayetoro Gbede',
    street: 'Ayetoro Gbede Highway',
    isWithinKogi: true,
    latitude: 7.9100,
    longitude: 6.0200
  },
  {
    name: 'Iluke Bunu Market Junction',
    address: 'Iluke Town, Kabba/Bunu',
    area: 'Iluke',
    lga: 'Kabba/Bunu',
    ward: 'Iluke',
    street: 'Iluke-Kabba Road',
    isWithinKogi: true,
    latitude: 7.8950,
    longitude: 6.1400
  },

  // ==========================================
  // 9. IJUMU LGA
  // ==========================================
  {
    name: 'Iyara Town Center (Ijumu LGA Secretariat)',
    address: 'Iyara Main Roundabout, Ijumu',
    area: 'Iyara',
    lga: 'Ijumu',
    ward: 'Iyara Central',
    street: 'Secretariat Road, Iyara',
    isWithinKogi: true,
    latitude: 7.8460,
    longitude: 5.9200
  },
  {
    name: 'Iyah-Gbede Community Junction',
    address: 'Iyah-Gbede Town Square, Ijumu',
    area: 'Iyah-Gbede',
    lga: 'Ijumu',
    ward: 'Iyah-Gbede',
    street: 'Iyah-Gbede Main Street',
    isWithinKogi: true,
    latitude: 7.8820,
    longitude: 5.9550
  },
  {
    name: 'Ogidi Historic Cave & Cultural Ground',
    address: 'Ogidi Ela Festival Ground, Ogidi',
    area: 'Ogidi',
    lga: 'Ijumu',
    ward: 'Ogidi',
    street: 'Ogidi Olofin Way',
    isWithinKogi: true,
    latitude: 7.9250,
    longitude: 5.9010
  },

  // ==========================================
  // 10. YAGBA WEST LGA
  // ==========================================
  {
    name: 'Odo-Ere LGA Secretariat & Market',
    address: 'Odo-Ere Central, Yagba West',
    area: 'Odo-Ere',
    lga: 'Yagba West',
    ward: 'Odo-Ere Central',
    street: 'Ilorin-Kabba Highway, Odo-Ere',
    isWithinKogi: true,
    latitude: 8.2300,
    longitude: 5.5200
  },
  {
    name: 'Egbe ECWA Hospital & College Gate',
    address: 'ECWA Hospital Road, Egbe, Yagba West',
    area: 'Egbe',
    lga: 'Yagba West',
    ward: 'Egbe Township',
    street: 'Hospital Road, Egbe',
    isWithinKogi: true,
    latitude: 8.2150,
    longitude: 5.5120
  },

  // ==========================================
  // 11. YAGBA EAST LGA
  // ==========================================
  {
    name: 'Isanlu Town Center (Yagba East HQ)',
    address: 'Isanlu Market Square, Yagba East',
    area: 'Isanlu',
    lga: 'Yagba East',
    ward: 'Isanlu Central',
    street: 'Isanlu Commercial Avenue',
    isWithinKogi: true,
    latitude: 8.2800,
    longitude: 5.8300
  },
  {
    name: 'Ife-Olukotun High Street',
    address: 'Ife-Olukotun Main Square, Yagba East',
    area: 'Ife-Olukotun',
    lga: 'Yagba East',
    ward: 'Ife-Olukotun',
    street: 'Olukotun Palace Road',
    isWithinKogi: true,
    latitude: 8.2450,
    longitude: 5.7600
  },

  // ==========================================
  // 12. MOPA-MURO LGA
  // ==========================================
  {
    name: 'Mopa Town Center & Bojuwon Roundabout',
    address: 'Mopa Main Road, Mopa-Muro',
    area: 'Mopa',
    lga: 'Mopa-Muro',
    ward: 'Mopa Township',
    street: 'Mopa Palace Way',
    isWithinKogi: true,
    latitude: 7.9600,
    longitude: 5.9000
  },
  {
    name: 'Effo Amuro Market Junction',
    address: 'Effo Amuro Town, Mopa-Muro',
    area: 'Effo Amuro',
    lga: 'Mopa-Muro',
    ward: 'Effo Amuro',
    street: 'Amuro High Street',
    isWithinKogi: true,
    latitude: 7.9890,
    longitude: 5.8650
  },

  // ==========================================
  // 13. DEKINA LGA
  // ==========================================
  {
    name: 'Prince Abubakar Audu University (PAAU) Main Gate, Anyigba',
    address: 'PAAU University Boulevard, Anyigba',
    area: 'Anyigba Campus City',
    lga: 'Dekina',
    ward: 'Anyigba (PAAU University City)',
    street: 'University Boulevard, Anyigba',
    isWithinKogi: true,
    latitude: 7.4950,
    longitude: 7.1820
  },
  {
    name: 'Anyigba Roundabout & Commercial Motor Park',
    address: 'Idah-Ankpa Road Interchange, Anyigba',
    area: 'Anyigba Center',
    lga: 'Dekina',
    ward: 'Anyigba (PAAU University City)',
    street: 'Ankpa-Ajaokuta Highway, Anyigba',
    isWithinKogi: true,
    latitude: 7.4920,
    longitude: 7.1750
  },
  {
    name: 'Dekina Town Center (Ogbe Gate)',
    address: 'Dekina Town Square, Dekina',
    area: 'Dekina Central',
    lga: 'Dekina',
    ward: 'Dekina Central',
    street: 'Dekina-Abocho Road',
    isWithinKogi: true,
    latitude: 7.6890,
    longitude: 7.0420
  },
  {
    name: 'Egume Community Market',
    address: 'Egume Town, Dekina',
    area: 'Egume',
    lga: 'Dekina',
    ward: 'Egume',
    street: 'Egume Main Way',
    isWithinKogi: true,
    latitude: 7.5540,
    longitude: 7.1210
  },

  // ==========================================
  // 14. ANKPA LGA
  // ==========================================
  {
    name: 'Ankpa Central Roundabout & Motor Park',
    address: 'Ankpa Roundabout, Ankpa Town',
    area: 'Ankpa Central',
    lga: 'Ankpa',
    ward: 'Ankpa Town (Central)',
    street: 'Makurdi-Lokoja Road, Ankpa',
    isWithinKogi: true,
    latitude: 7.6320,
    longitude: 7.6310
  },
  {
    name: 'Kogi State College of Education Ankpa Gate',
    address: 'College Road, Ankpa',
    area: 'Ankpa College Area',
    lga: 'Ankpa',
    ward: 'Ankpa Town (Central)',
    street: 'College Boulevard, Ankpa',
    isWithinKogi: true,
    latitude: 7.6410,
    longitude: 7.6250
  },
  {
    name: 'Enjema Community Junction',
    address: 'Enjema Town Square, Ankpa',
    area: 'Enjema',
    lga: 'Ankpa',
    ward: 'Enjema',
    street: 'Enjema-Ankpa Road',
    isWithinKogi: true,
    latitude: 7.5890,
    longitude: 7.6950
  },

  // ==========================================
  // 15. IDAH LGA
  // ==========================================
  {
    name: 'Attah of Igala Palace & Royal Square',
    address: 'Palace Way, Idah',
    area: 'Idah Central',
    lga: 'Idah',
    ward: 'Attah of Igala Palace Ward',
    street: 'Attah Palace Boulevard, Idah',
    isWithinKogi: true,
    latitude: 7.1080,
    longitude: 6.7450
  },
  {
    name: 'Federal Polytechnic Idah Main Gate',
    address: 'Polytechnic Road, Idah',
    area: 'Federal Poly Idah',
    lga: 'Idah',
    ward: 'Federal Polytechnic Idah Gate',
    street: 'Federal Poly Expressway, Idah',
    isWithinKogi: true,
    latitude: 7.1120,
    longitude: 6.7410
  },
  {
    name: 'Idah River Port & Waterfront Jetty',
    address: 'River Niger Jetty, Idah',
    area: 'Idah Waterfront',
    lga: 'Idah',
    ward: 'Idah Waterfront & Port',
    street: 'Marine Port Road, Idah',
    isWithinKogi: true,
    latitude: 7.1020,
    longitude: 6.7320
  },

  // ==========================================
  // 16. BASSA LGA
  // ==========================================
  {
    name: 'Oguma Town Center (Bassa LGA Secretariat)',
    address: 'Oguma Roundabout, Bassa',
    area: 'Oguma',
    lga: 'Bassa',
    ward: 'Oguma Central',
    street: 'Oguma-Gboloko Road',
    isWithinKogi: true,
    latitude: 7.7400,
    longitude: 6.9500
  },
  {
    name: 'Gboloko River Basin Town',
    address: 'Gboloko Main Square, Bassa',
    area: 'Gboloko',
    lga: 'Bassa',
    ward: 'Gboloko',
    street: 'River Benue Access Road, Gboloko',
    isWithinKogi: true,
    latitude: 7.8100,
    longitude: 6.9950
  },

  // ==========================================
  // 17. IBAJI LGA
  // ==========================================
  {
    name: 'Onyedega Town Center (Ibaji LGA HQ)',
    address: 'Onyedega Square, Ibaji',
    area: 'Onyedega',
    lga: 'Ibaji',
    ward: 'Onyedega Central',
    street: 'Onyedega Waterways Road',
    isWithinKogi: true,
    latitude: 6.9100,
    longitude: 6.8200
  },
  {
    name: 'Odeke Petroleum Exploration Hub',
    address: 'Odeke Town, Ibaji',
    area: 'Odeke',
    lga: 'Ibaji',
    ward: 'Odeke',
    street: 'Odeke Oil Basin Road',
    isWithinKogi: true,
    latitude: 6.8650,
    longitude: 6.8400
  },

  // ==========================================
  // 18. IGALAMELA-ODOLU LGA
  // ==========================================
  {
    name: 'Ajaka Town Roundabout (Igalamela HQ)',
    address: 'Ajaka Central, Igalamela-Odolu',
    area: 'Ajaka',
    lga: 'Igalamela-Odolu',
    ward: 'Ajaka Ward 1',
    street: 'Idah-Nsukka Highway, Ajaka',
    isWithinKogi: true,
    latitude: 7.0200,
    longitude: 6.9500
  },
  {
    name: 'Odolu Community Market',
    address: 'Odolu Square, Igalamela-Odolu',
    area: 'Odolu',
    lga: 'Igalamela-Odolu',
    ward: 'Odolu Central',
    street: 'Odolu Palm Produce Road',
    isWithinKogi: true,
    latitude: 6.9850,
    longitude: 7.0100
  },

  // ==========================================
  // 19. OFU LGA
  // ==========================================
  {
    name: 'Ugwolawo Town Center (Ofu LGA Secretariat)',
    address: 'Ugwolawo Roundabout, Ofu',
    area: 'Ugwolawo',
    lga: 'Ofu',
    ward: 'Ugwolawo Central',
    street: 'Ajaokuta-Anyigba Expressway, Ugwolawo',
    isWithinKogi: true,
    latitude: 7.3300,
    longitude: 6.9400
  },
  {
    name: 'Itobe River Niger Bridgehead & Fish Market',
    address: 'Itobe Bridge Approach, Ofu',
    area: 'Itobe',
    lga: 'Ofu',
    ward: 'Itobe Bridge & River Port',
    street: 'Itobe Bridgehead Way',
    isWithinKogi: true,
    latitude: 7.4200,
    longitude: 6.8500
  },
  {
    name: 'Ochadamu Mission Hospital Junction',
    address: 'Ochadamu Village, Ofu',
    area: 'Ochadamu',
    lga: 'Ofu',
    ward: 'Ochadamu',
    street: 'Ochadamu Hospital Road',
    isWithinKogi: true,
    latitude: 7.3750,
    longitude: 7.0200
  },

  // ==========================================
  // 20. OLAMABORO LGA
  // ==========================================
  {
    name: 'Okpo Town Center (Olamaboro LGA HQ)',
    address: 'Okpo Roundabout, Olamaboro',
    area: 'Okpo',
    lga: 'Olamaboro',
    ward: 'Okpo Central',
    street: 'Ankpa-Otukpo Road, Okpo',
    isWithinKogi: true,
    latitude: 7.2300,
    longitude: 7.4200
  },
  {
    name: 'Imane Market Square',
    address: 'Imane Town, Olamaboro',
    area: 'Imane',
    lga: 'Olamaboro',
    ward: 'Imane Ward 1',
    street: 'Imane Commerce Way',
    isWithinKogi: true,
    latitude: 7.3100,
    longitude: 7.4600
  },
  {
    name: 'Ogugu Cashew Processing Hub',
    address: 'Ogugu Central, Olamaboro',
    area: 'Ogugu',
    lga: 'Olamaboro',
    ward: 'Ogugu Ward 1',
    street: 'Ogugu Agro Road',
    isWithinKogi: true,
    latitude: 7.1850,
    longitude: 7.5100
  },

  // ==========================================
  // 21. OMALA LGA
  // ==========================================
  {
    name: 'Abejukolo Town Center (Omala LGA HQ)',
    address: 'Abejukolo Square, Omala',
    area: 'Abejukolo',
    lga: 'Omala',
    ward: 'Abejukolo Central',
    street: 'Abejukolo Main Street',
    isWithinKogi: true,
    latitude: 7.7100,
    longitude: 7.5300
  },
  {
    name: 'Bagana River Benue Port & Market',
    address: 'Bagana Port Approach, Omala',
    area: 'Bagana',
    lga: 'Omala',
    ward: 'Bagana River Port',
    street: 'Bagana Waterfront Road',
    isWithinKogi: true,
    latitude: 7.8500,
    longitude: 7.5900
  }
];

// Helper functions for easy querying
export function getAllKogiLGAs(): string[] {
  return KOGI_LGAS_METADATA.map((lga) => lga.name);
}

export function getLGAInfo(lgaName: string): KogiLGAInfo | undefined {
  return KOGI_LGAS_METADATA.find(
    (l) => l.name.toLowerCase() === lgaName.toLowerCase()
  );
}

export function getWardsForLGA(lgaName: string): string[] {
  const lga = getLGAInfo(lgaName);
  return lga ? lga.wards : [];
}

export function getLocationsForLGA(lgaName: string): LocationPoint[] {
  return ALL_KOGI_STREET_LOCATIONS.filter(
    (loc) => loc.lga.toLowerCase() === lgaName.toLowerCase()
  );
}

export function searchLocations(query: string): LocationPoint[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_KOGI_STREET_LOCATIONS;
  return ALL_KOGI_STREET_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.area.toLowerCase().includes(q) ||
      loc.lga.toLowerCase().includes(q) ||
      (loc.ward && loc.ward.toLowerCase().includes(q)) ||
      (loc.street && loc.street.toLowerCase().includes(q))
  );
}
