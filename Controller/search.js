
const admin = require('firebase-admin');

const get_search = async (req, res) => {
  const { search } = req.query;
  const searchNormalized = search ? search.trim().toLowerCase().replace(/\s/g, '') : '';

  try {
    

    

    const db = admin.firestore();
    const agenciesRef = await db.collection('approvedAgency').get();

    const uniqueAgencyId = new Set();

    agenciesRef.forEach((doc) => {
      const agency = doc.data();
      console.log(agency);

      if (Array.isArray(agency.name)) {
        // If 'name' is an array, iterate through it
        agency.name.forEach((name) => {
          if (name && name.toLowerCase().replace(/\s/g, '').includes(searchNormalized)) {
            uniqueAgencyId.add(doc.id);
          }
        });
      } else if (agency.name && agency.name.toLowerCase().replace(/\s/g, '').includes(searchNormalized)) {
        // If 'name' is a string
        uniqueAgencyId.add(doc.id);
      }
    });

    const searchResults = [];

    for (const agencyId of uniqueAgencyId) {
      const agencyDoc = await db.collection('agencies').doc(agencyId).get();

      if (agencyDoc.exists) {
        searchResults.push({ id: agencyId , ...agencyDoc.data()});;
      } else {
        res.status(400).send({ error: 'Agency does not exist' });
        return;
      }
    }

    if (searchResults.length === 0) {
      res.status(400).send({ error: 'No Agency found' });
      return;
    }

    res.status(200).json({ message: 'Agency found', data: searchResults });
  } catch (error) {
    console.error('Error retrieving Agency:', error);
    res.status(400).json({ message: 'Could not retrieve Agency', error: error.message });
  }
};

module.exports = { get_search };
