
module.exports = {
  content: [
    // ESSENTIEEL: Vertel Tailwind waar het moet scannen voor klassen!
    "./*.html",        // Scant index.html, header.html, etc., in de root
    "./js/**/*.js",    // Scant je JavaScript-bestanden
    // Voeg hier andere mappen toe indien nodig, bijv. "./includes/*.html"
  ],
  theme: {
    extend: {
      colors: {
        // AANGEPASTE KLEUREN VANUIT JE @THEME BLOK
        'milk': '#fdfcf8ff',
        'coal': '#404040ff',
        'grey': '#eaeaeaff',
        
        // Gebruik de definitieve waarden uit je :root sectie
        'mint': '#b0f4d3ff', 
        'pink': '#f4b0d3ff', 
        'rose': '#f4c9d1ff',
        'yellow': '#f4fdac',
      },
      fontFamily: {
        // FONTS VANUIT JE @THEME BLOK EN @layer base
        'body': ['Nunito', 'sans-serif'],
        'heading': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'spacemono': ['Space Mono', 'monospace'],
      },
      // Andere uitbreidingen
      // Je kunt hier ook de custom font weights en sizes overzetten, 
      // maar het is vaak beter om de standaard van Tailwind te volgen.
    },
    // Om de standaard kleuren te overschrijven (niet alleen uit te breiden):
    // colors: {
    //    'white': '#fff',
    //    'black': '#000',
    //    // ALLE andere standaard Tailwind-kleuren ZIJN DAN VERWIJDERD
    // }
  },
  plugins: [],
}