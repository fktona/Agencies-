const admin = require('firebase-admin');


const get_agencies_by_location = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: 'Location parameter is required' });
        }

        const db = admin.firestore();
        const agenciesCollection = db.collection("agencies");

        
        const snapshot = await agenciesCollection.where('location', '==', location).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No agencies found for the specified location' });
        }

       
        const agencies = [];
        snapshot.forEach(doc => {
            agencies.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ message: 'Agencies found for the specified location', data: agencies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request', details: error.message });
    }
};
   const get_location = async (req, res) => {
    try{ const location = ['Kano' ,'Lagos Mainland', 'Lagos Island', 'Abuja']
     res.status(200).json({message: 'Location retrieved successfully' , data: location})
 } catch(err){
     res.status(400).json({message: 'can not retrieve location list' , error: err.message})
 }
   }

module.exports = {
 
    get_agencies_by_location,
    get_location
};
