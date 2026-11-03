// Every location fact lives here, so the demo can move to another market by changing one file.
//
// Phone: Ofcom reserves 01632 960000 to 960999 for drama and has no range for Aberdeen, so it
// suggests this one. Mobile drama range: 07700 900000 to 900999.
// https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama (checked 3 Nov 2026)
//
// Gas emergency: the real National Gas Emergency Service number and advice, from SGN, the gas
// network for Scotland. https://www.sgn.co.uk/smellgas and
// https://www.sgn.co.uk/help-and-advice/keeping-gas-safe/carbon-monoxide (checked 3 Nov 2026)

export const location = {
  businessName: "Kirkgate Heating & Plumbing",
  city: "Aberdeen",
  // Deliberately made up, with no postcode, so it cannot be mistaken for a real premises.
  address: "1 Pretend Yard, Aberdeen",
  areas: ["Bridge of Don", "Cults", "Westhill"],
  locale: "en-GB",
  timeZone: "Europe/London",
  currency: "GBP",
  currencySymbol: "£",
  depositPounds: 25,
  phone: { display: "01632 960 472", tel: "+441632960472" },
  hours: [
    { days: "Monday to Friday", times: "08:00 to 18:00" },
    { days: "Saturday", times: "09:00 to 13:00" },
  ],
  gasEmergency: {
    name: "National Gas Emergency Service",
    display: "0800 111 999",
    tel: "+44800111999",
    relayDisplay: "18001 0800 111 999",
  },
  lifeEmergency: { display: "999", tel: "999" },
} as const;
