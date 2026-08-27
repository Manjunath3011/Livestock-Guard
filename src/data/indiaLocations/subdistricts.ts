import { IndianSubDistrict } from '../../types/location';

export const INDIAN_SUB_DISTRICTS: IndianSubDistrict[] = [
  // Pune District Sub-Districts (Talukas / Blocks)
  {
    id: 'sd_in_mh_pune_baramati',
    districtId: 'dt_in_mh_pune',
    stateId: 'st_in_mh',
    lgdCode: 4182,
    name: 'Baramati',
    type: 'TALUKA',
    localNames: { mr: 'बारामती', hi: 'बारामती' },
    centerCoordinates: { latitude: 18.1512, longitude: 74.5789, source: 'ADMIN_CENTROID' },
    aliases: ['bk_baramati', 'Baramati Taluka']
  },
  {
    id: 'sd_in_mh_pune_haveli',
    districtId: 'dt_in_mh_pune',
    stateId: 'st_in_mh',
    lgdCode: 4183,
    name: 'Haveli (Pune Rural / Wagholi)',
    type: 'TALUKA',
    localNames: { mr: 'हवेली', hi: 'हवेली' },
    centerCoordinates: { latitude: 18.5300, longitude: 73.9500, source: 'ADMIN_CENTROID' },
    aliases: ['bk_haveli', 'Haveli']
  },
  {
    id: 'sd_in_mh_pune_shirur',
    districtId: 'dt_in_mh_pune',
    stateId: 'st_in_mh',
    lgdCode: 4184,
    name: 'Shirur (Ghodnadi)',
    type: 'TALUKA',
    localNames: { mr: 'शिरूर', hi: 'शिरूर' },
    centerCoordinates: { latitude: 18.8284, longitude: 74.3789, source: 'ADMIN_CENTROID' },
    aliases: ['bk_shirur', 'Shirur']
  },
  {
    id: 'sd_in_mh_pune_daund',
    districtId: 'dt_in_mh_pune',
    stateId: 'st_in_mh',
    lgdCode: 4185,
    name: 'Daund',
    type: 'TALUKA',
    localNames: { mr: 'दौंड', hi: 'दौंड' },
    centerCoordinates: { latitude: 18.4628, longitude: 74.5824, source: 'ADMIN_CENTROID' },
    aliases: ['bk_daund', 'Daund']
  },
  {
    id: 'sd_in_mh_pune_indapur',
    districtId: 'dt_in_mh_pune',
    stateId: 'st_in_mh',
    lgdCode: 4186,
    name: 'Indapur',
    type: 'TALUKA',
    localNames: { mr: 'इंदापूर', hi: 'इंदापुर' },
    centerCoordinates: { latitude: 18.1158, longitude: 75.0345, source: 'ADMIN_CENTROID' },
    aliases: ['bk_indapur', 'Indapur']
  },

  // Satara District Sub-Districts
  {
    id: 'sd_in_mh_satara_karad',
    districtId: 'dt_in_mh_satara',
    stateId: 'st_in_mh',
    lgdCode: 4190,
    name: 'Karad',
    type: 'TALUKA',
    localNames: { mr: 'कराड', hi: 'कराड' },
    centerCoordinates: { latitude: 17.2891, longitude: 74.1812, source: 'ADMIN_CENTROID' },
    aliases: ['bk_karad', 'Karad']
  },
  {
    id: 'sd_in_mh_satara_phaltan',
    districtId: 'dt_in_mh_satara',
    stateId: 'st_in_mh',
    lgdCode: 4191,
    name: 'Phaltan',
    type: 'TALUKA',
    localNames: { mr: 'फलटण', hi: 'फलटण' },
    centerCoordinates: { latitude: 17.9891, longitude: 74.4312, source: 'ADMIN_CENTROID' },
    aliases: ['bk_phaltan', 'Phaltan']
  },

  // Belagavi District (Karnataka)
  {
    id: 'sd_in_ka_belagavi_chikodi',
    districtId: 'dt_in_ka_belagavi',
    stateId: 'st_in_ka',
    lgdCode: 5540,
    name: 'Chikodi',
    type: 'TALUKA',
    localNames: { kn: 'ಚಿಕ್ಕೋಡಿ', hi: 'चिक्कोडी' },
    centerCoordinates: { latitude: 16.4300, longitude: 74.5900, source: 'ADMIN_CENTROID' },
    aliases: ['bk_chikodi', 'Chikodi']
  },
  {
    id: 'sd_in_ka_belagavi_gokak',
    districtId: 'dt_in_ka_belagavi',
    stateId: 'st_in_ka',
    lgdCode: 5541,
    name: 'Gokak',
    type: 'TALUKA',
    localNames: { kn: 'ಗೋಕಾಕ', hi: 'गोकाक' },
    centerCoordinates: { latitude: 16.1667, longitude: 74.8333, source: 'ADMIN_CENTROID' },
    aliases: ['bk_gokak', 'Gokak']
  },

  // Mysuru District (Karnataka)
  {
    id: 'sd_in_ka_mysuru_nanjangud',
    districtId: 'dt_in_ka_mysuru',
    stateId: 'st_in_ka',
    lgdCode: 5560,
    name: 'Nanjangud',
    type: 'TALUKA',
    localNames: { kn: 'ನಂಜನಗೂಡು', hi: 'नंजनगुड़' },
    centerCoordinates: { latitude: 12.1197, longitude: 76.6808, source: 'ADMIN_CENTROID' },
    aliases: ['bk_nanjangud', 'Nanjangud']
  },
  {
    id: 'sd_in_ka_mysuru_hunsur',
    districtId: 'dt_in_ka_mysuru',
    stateId: 'st_in_ka',
    lgdCode: 5561,
    name: 'Hunsur',
    type: 'TALUKA',
    localNames: { kn: 'ಹುಣಸೂರು', hi: 'हुणसूर' },
    centerCoordinates: { latitude: 12.3088, longitude: 76.2917, source: 'ADMIN_CENTROID' },
    aliases: ['bk_hunsur', 'Hunsur']
  },

  // Anand District (Gujarat)
  {
    id: 'sd_in_gj_anand_rural',
    districtId: 'dt_in_gj_anand',
    stateId: 'st_in_gj',
    lgdCode: 3780,
    name: 'Anand Rural',
    type: 'TALUKA',
    localNames: { gu: 'આણંદ ગ્રામ્ય', hi: 'आणंद ग्रामीण' },
    centerCoordinates: { latitude: 22.5645, longitude: 72.9289, source: 'ADMIN_CENTROID' },
    aliases: ['bk_anand_rural', 'Anand Rural']
  },
  {
    id: 'sd_in_gj_anand_petlad',
    districtId: 'dt_in_gj_anand',
    stateId: 'st_in_gj',
    lgdCode: 3781,
    name: 'Petlad',
    type: 'TALUKA',
    localNames: { gu: 'પેટલાદ', hi: 'पेटलाद' },
    centerCoordinates: { latitude: 22.4744, longitude: 72.8028, source: 'ADMIN_CENTROID' },
    aliases: ['bk_petlad', 'Petlad']
  },
  {
    id: 'sd_in_gj_anand_borsad',
    districtId: 'dt_in_gj_anand',
    stateId: 'st_in_gj',
    lgdCode: 3782,
    name: 'Borsad',
    type: 'TALUKA',
    localNames: { gu: 'બોરસદ', hi: 'बोरसद' },
    centerCoordinates: { latitude: 22.4100, longitude: 72.9000, source: 'ADMIN_CENTROID' },
    aliases: ['bk_borsad', 'Borsad']
  },

  // Meerut District (Uttar Pradesh)
  {
    id: 'sd_in_up_meerut_daurala',
    districtId: 'dt_in_up_meerut',
    stateId: 'st_in_up',
    lgdCode: 1320,
    name: 'Daurala Block',
    type: 'BLOCK',
    localNames: { hi: 'दौराला' },
    centerCoordinates: { latitude: 29.1123, longitude: 77.7123, source: 'ADMIN_CENTROID' },
    aliases: ['bk_daurala', 'Daurala']
  },
  {
    id: 'sd_in_up_meerut_hastinapur',
    districtId: 'dt_in_up_meerut',
    stateId: 'st_in_up',
    lgdCode: 1321,
    name: 'Hastinapur Block',
    type: 'BLOCK',
    localNames: { hi: 'हस्तिनापुर' },
    centerCoordinates: { latitude: 29.1667, longitude: 78.0167, source: 'ADMIN_CENTROID' },
    aliases: ['bk_hastinapur', 'Hastinapur']
  },
  {
    id: 'sd_in_up_meerut_sardhana',
    districtId: 'dt_in_up_meerut',
    stateId: 'st_in_up',
    lgdCode: 1322,
    name: 'Sardhana Block',
    type: 'BLOCK',
    localNames: { hi: 'सरधना' },
    centerCoordinates: { latitude: 29.1500, longitude: 77.6167, source: 'ADMIN_CENTROID' },
    aliases: ['bk_sardhana', 'Sardhana']
  },

  // Ludhiana District (Punjab)
  {
    id: 'sd_in_pb_ludhiana_jagraon',
    districtId: 'dt_in_pb_ludhiana',
    stateId: 'st_in_pb',
    lgdCode: 245,
    name: 'Jagraon',
    type: 'BLOCK',
    localNames: { pa: 'ਜਗਰਾਉਂ', hi: 'जgraon' },
    centerCoordinates: { latitude: 30.7891, longitude: 75.4812, source: 'ADMIN_CENTROID' },
    aliases: ['bk_jagraon', 'Jagraon']
  },
  {
    id: 'sd_in_pb_ludhiana_khanna',
    districtId: 'dt_in_pb_ludhiana',
    stateId: 'st_in_pb',
    lgdCode: 246,
    name: 'Khanna',
    type: 'BLOCK',
    localNames: { pa: 'ਖੰਨਾ', hi: 'खन्ना' },
    centerCoordinates: { latitude: 30.7123, longitude: 76.1812, source: 'ADMIN_CENTROID' },
    aliases: ['bk_khanna', 'Khanna']
  },

  // Guntur District (Andhra Pradesh)
  {
    id: 'sd_in_ap_guntur_tenali',
    districtId: 'dt_in_ap_guntur',
    stateId: 'st_in_ap',
    lgdCode: 4890,
    name: 'Tenali Mandal',
    type: 'MANDAL',
    localNames: { te: 'తెనాలి', hi: 'तेनाली' },
    centerCoordinates: { latitude: 16.2435, longitude: 80.6400, source: 'ADMIN_CENTROID' },
    aliases: ['bk_tenali', 'Tenali']
  }
];
