module.exports = {
  getVacation: async (options = {}) => {
    const vacations = [
      {
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description:
          'Spend a day sailing on the Columbia and ' +
          'enjoying craft beers in Hood River!',
        location: {
          // we'll use this for geocoding later in the book
          search: 'Hood River, Oregon, USA'
        },
        price: 99.95,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0
      }
    ]
    if (options.available !== undefined) {
      return vacations.filter(
        ({ available }) => available === options.available
      )
    }
    return vacations
  },
  addVacationInSeasonListener: async (email, sku) => {
    // we'll just pretend we did this...since this is
    // an async function, a new promise will automatically
    // be returned that simply resolves to undefined
  }
}
