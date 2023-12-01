const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

// Initialize Firebase Storage


const create_agencies = async (req, res) => {
  const storage = admin.storage();
  const bucket = storage.bucket();
  
    try {
        const { services, about, name, website, phone_number, location, address , featured} = req.body;
const requiredFields = ['services', 'about', 'name', 'website', 'phone_number', 'location', 'address'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ error: 'Missing required fields', missingFields });
        }
        // Input validation
        if (!services || !about || !name || !website || !phone_number || !location || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Upload logo to Firebase Storage
        const logoFile = req.file; // Assuming you are using a middleware like Multer for file uploads

        if (!logoFile) {
            return res.status(400).json({ error: 'Logo file is required' });
        }

        const logoFileName = `${uuidv4()}_${logoFile.originalname}`;
        const logoFileUpload = bucket.file(logoFileName);

        const stream = logoFileUpload.createWriteStream({
            metadata: {
                contentType: logoFile.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ error: 'Error uploading logo to Firebase Storage', details: err.message });
        });

        stream.on('finish', async () => {
            
const [logoDownloadURL] = await logoFileUpload.getSignedUrl({ action: 'read', expires: '01-01-2100' });

            
            const data = {
                name,
                services,
                about,
                website,
                phone_number,
                location,
                address,
              featured: featured || null, 
                logoURL: logoDownloadURL, // Add the logo URL to the data
            };

            // Add data to Firestore
            const db = admin.firestore();
            const agencyDocRef = await db.collection("agencies").add(data);

            res.status(201).json({ message: 'Request sent successfully', data: data });
        });

        // Pipe the logo file stream to Firebase Storage
        stream.end(logoFile.buffer);
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending the request', details: error.message });
    }
};


const get_agency = async (req ,res) => {
  
  try{
   const db = admin.firestore();
    const agenciesRef = await db.collection('agencies').get();
  
   let agencies =[]
     agenciesRef.forEach((doc) =>{
      
     const id = doc.id
     const data = doc.data()
     agencies.push({id:id , data:data})
     
     })
     
     res.status(200).json({data: agencies})
    
  }catch(error){
    res.send({error:error})
  }
}
const getAgencyById = async (req, res) => {
  try {
    const {id:agencyId} = req.params ;

    if (!agencyId) {
      
      return res.status(400).json({ error: 'Agency ID is required.' });
    }

    
    const db = admin.firestore();

    
    const agencyRef = await db.collection('agencies').doc(agencyId).get();

    if (!agencyRef.exists) {
      
      return res.status(404).json({ error: 'Agency not found.' });
    }

 
    const agencyData = agencyRef.data();

  
    res.status(200).json({ data: agencyData });
  } catch (error) {
  
    res.status(500).json({ error: error.message });
  }
};




module.exports = { create_agencies,upload, get_agency, getAgencyById };



