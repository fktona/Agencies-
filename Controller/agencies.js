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
      
        if (!services || !about || !name || !website || !phone_number || !location || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

      
        const logoFile = req.file; 

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
                status: pending, 
                logoURL: logoDownloadURL,
            };

            
            const db = admin.firestore();
            const agencyDocRef = await db.collection("agencies").add(data);

            res.status(201).json({ message: 'Request sent successfully', data: data });
        });

        
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

  const approveAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    if (!agencyId) {
      return res.status(400).json({ error: 'Agency ID is required' });
    }

    const db = admin.firestore();
    const agencyDocRef = db.collection('agencies').doc(agencyId);

    const agencySnapshot = await agencyDocRef.get();

    if (!agencySnapshot.exists) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    
    await agencyDocRef.update({ status: 'approved' });

    const updatedAgencySnapshot = await agencyDocRef.get();
    const updatedAgencyData = updatedAgencySnapshot.data();
    await db.collection("approvedAgency").add(updatedAgencyData)

    res.status(200).json({
      message: 'Agency status updated to approved',
      data: updatedAgencyData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while updating agency status',
      details: error.message,
    });
  }
};

const getApprovedAgencies = async (req, res) => {
  try {
    const db = admin.firestore();
    const approvedAgenciesSnapshot = await db.collection('approvedAgency').get();

    if (approvedAgenciesSnapshot.empty) {
      return res.status(404).json({ error: 'No approved agencies found' });
    }

    let approvedAgencies =[]
     approvedAgenciesSnapshot.forEach(async (doc) =>{
      
     const id = doc.id
     const data = doc.data()
     approvedAgencies.push({id:id , data:data})
       
     
     })
    res.status(200).json({
      message: 'Approved agencies retrieved successfully',
      data: approvedAgencies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while retrieving approved agencies',
      details: error.message,
    });
  }
};






module.exports = { create_agencies,upload, get_agency, getAgencyById, approveAgency,getApprovedAgencies };



