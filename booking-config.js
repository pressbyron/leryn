/* Add the TWO NEW AI course event paths here, once configured in Cal.com.
   Do not use eucstockholm/60min: that is the existing unicycle lesson.
   Each event should be 120 minutes, online, with 4–8 seats during the pilot,
   399 SEK per participant and Swish instructions in the confirmation.
   Increase capacity to 30 only when ready. Keep scheduling in Cal.com.
   Example path format: your-account/event-slug (not a full URL). */
window.LERYN_BOOKING = {
  origin: 'https://app.cal.com',
  contactEmail: 'peter.jaaskelainen@gmail.com',
  courses: {
    app: { title: 'Bygg din första app.', calLink: 'peter-jaaskelainen-vlpjko/app-kurs-120m' },
    game: { title: 'Bygg ditt första spel.', calLink: 'peter-jaaskelainen-vlpjko/spel-kurs-120m' }
  }
};
