export default function handler(req, res) {
  const { tenantId } = req.query;
  
  if (req.method === 'GET') {
    res.status(200).json({ 
      tenantId: tenantId,
      users: [],
      message: 'Users endpoint working'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
