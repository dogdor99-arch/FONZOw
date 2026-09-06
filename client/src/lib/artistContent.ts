export type FeaturedArtist = {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  description: string;
  descriptionEn: string;
  image?: string;
  sourceUrl: string;
  guitar?: string;
};

/** Public artist references collected from Fonzo Guitar's public Facebook posts. */
export const FEATURED_ARTISTS: FeaturedArtist[] = [
  {
    id: "mangkorn",
    name: "อาจารย์มังกร",
    nameEn: "Ajarn Mangkorn",
    role: "Fonzo Artist · ศิลปินกีตาร์",
    roleEn: "Fonzo Artist · Guitar artist",
    description: "ศิลปินที่ปรากฏในคอนเทนต์ของ Fonzo กับกีตาร์รุ่น V-31SSB SJ Cutaway",
    descriptionEn: "Featured in Fonzo content with the V-31SSB SJ Cutaway.",
    image: "https://scontent-sin2-2.xx.fbcdn.net/v/t15.5256-10/659409615_1263378205225544_5807057202161016669_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=596eb7&_nc_ohc=5hmEnMmdZQkQ7kNvwGgiUkN&_nc_oc=AdqdeLDEAh9g6OtTVkt987u6fecJN32qc6Izs7PNEdaXaJ-Hh9r9fLlM2iHJdwK-7B0&_nc_zt=23&_nc_ht=scontent-sin2-2.xx&_nc_gid=kGQuFv1-vIlo--WB9zuFQg&_nc_ss=7e20f&oh=00_AQJI3h_H7GM4-78sXG_WwW-YgNcVItfPnB7OXqB9UJ4AdQ&oe=6AA2D615",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/videos/1470719054763913/",
    guitar: "Fonzo V-31SSB SJ Cutaway",
  },
  {
    id: "hugo",
    name: "ฮิวโก้",
    nameEn: "Hugo",
    role: "Fonzo Artist · นักร้องและนักดนตรี",
    roleEn: "Fonzo Artist · Singer and musician",
    description: "ปรากฏในคอนเทนต์การแจมกีตาร์กับคุณเบิร์ด โดยใช้ Fonzo V-34C",
    descriptionEn: "Featured in a guitar jam with Bird, playing a Fonzo V-34C.",
    image: "https://scontent-sin6-1.xx.fbcdn.net/v/t15.5256-10/595884652_1347826093503453_99396964839358293_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=596eb7&_nc_ohc=n2HgASzInDEQ7kNvwG-TJM9&_nc_oc=Adq1a1h_obJI_Acrf5dz2kea7GjiuphhgRav3raTuwQ_y7pg7yXOiZg6EUXyR8bRWrY&_nc_zt=23&_nc_ht=scontent-sin6-1.xx&_nc_gid=ZO6Kbzim2u5DKKLbOYUNCQ&_nc_ss=7e20f&oh=00_AQIcUoJEjhr-KjauP7DPp9sFJT-vIGd9GM8WwUUBqjVBoQ&oe=6AA2FF9D",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/videos/1592682072091882/",
    guitar: "Fonzo V-34C",
  },
  {
    id: "earn",
    name: "เอิน",
    nameEn: "Earn",
    role: "Fonzo Artist · ศิลปิน",
    roleEn: "Fonzo Artist · Artist",
    description: "ศิลปินจาก Fonzo Artist ที่ร่วมถ่ายทอดเสียงเพลงกับกีตาร์ Fonzo รุ่น Wood Land",
    descriptionEn: "A Fonzo Artist featured with the Fonzo Wood Land guitar.",
    image: "https://scontent-sin11-2.xx.fbcdn.net/v/t15.5256-10/742284226_980188318185551_1377268018136675889_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a27664&_nc_ohc=VM8scSUYEM0Q7kNvwE3ASqL&_nc_oc=AdqnWGI3cFHPIlUWr_osOxOuL2vScYioGsamjPs2LS6tvCO9aA5pwH9srbfQ19cvLwY&_nc_zt=23&_nc_ht=scontent-sin11-2.xx&_nc_gid=CAw3PRNawItaaTJt8x5QHw&_nc_ss=7e20f&oh=00_AQI2GDgU41CmqRTKsgC-k-4XMzFKMv9xsAWyH03OX6WN4Q&oe=6AA2FC4A",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/videos/2173605763487416/",
    guitar: "Fonzo Wood Land",
  },
  {
    id: "yuki-matsui",
    name: "Yuki Matsui",
    nameEn: "Yuki Matsui",
    role: "ศิลปินกีตาร์ Fingerstyle จากญี่ปุ่น",
    roleEn: "Japanese fingerstyle guitarist",
    description: "ศิลปินกีตาร์ Fingerstyle จากญี่ปุ่นที่ปรากฏในคอนเทนต์กับ Fonzo V-301S Cutaway",
    descriptionEn: "A Japanese fingerstyle guitarist featured with the Fonzo V-301S Cutaway.",
    image: "https://scontent-sin2-1.xx.fbcdn.net/v/t15.5256-10/458596503_397144553127079_5180337184565278324_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=a27664&_nc_ohc=6gx7SihPXlkQ7kNvwG6ncKP&_nc_oc=Adohdz9RNmPKXNqGn1Ofz8QUPucqExvLapuEwU3_UkHFaaD9u7oVJ1BXm-qYk-RLbbis&_nc_zt=23&_nc_ht=scontent-sin2-1.xx&_nc_gid=diuBkuO0K600rFtK3BsYfQ&_nc_ss=7e20f&oh=00_AQLj0pLySQMvLVFqFtvF_fiCYkYzmD1mN6szTR6DLXbhmw&oe=6AA2DC7E",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/videos/1448391812487772/",
    guitar: "Fonzo V-301S Cutaway",
  },
  {
    id: "thaowan",
    name: "เถาวัลย์ (THAOWAN)",
    nameEn: "THAOWAN",
    role: "ศิลปินฮิปฮอปไทย",
    roleEn: "Thai hip-hop artist",
    description: "ศิลปินฮิปฮอปไทยที่ปรากฏในคอนเทนต์บนเวทีกับ Fonzo V-34S",
    descriptionEn: "A Thai hip-hop artist featured on stage with a Fonzo V-34S.",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/photos/1454893456444713/",
    guitar: "Fonzo V-34S",
  },
  {
    id: "may",
    name: "น้องเมย์",
    nameEn: "May",
    role: "ผู้เล่นที่ร่วมรีวิวกีตาร์ Fonzo",
    roleEn: "Featured Fonzo player",
    description: "ผู้เล่นที่ปรากฏในคอนเทนต์รีวิว Fonzo V-31SSB SJ Cutaway",
    descriptionEn: "Featured in a Fonzo V-31SSB SJ Cutaway review.",
    image: "https://scontent-sin11-1.xx.fbcdn.net/v/t15.5256-10/774665954_1576853817285808_4107679687674735020_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=596eb7&_nc_ohc=uhogLkQu0sUQ7kNvwG_C0_N&_nc_oc=Adp8FwrYpt7JnotcL3yc1I1CW_nI-28sZTCUEEFipnghCesJUXuu_ZhVyjNoLXSmfEY&_nc_zt=23&_nc_ht=scontent-sin11-1.xx&_nc_gid=zuNZ_7EC_-zJtu5ezJl2oQ&_nc_ss=7e20f&oh=00_AQKAehJ4PgycMA9WIxuO3hbl4usasPgNl53kXL686U0mtA&oe=6AA2D983",
    sourceUrl: "https://www.facebook.com/Fonzoguitar/videos/1308976787981497/",
    guitar: "Fonzo V-31SSB SJ Cutaway",
  },
];
