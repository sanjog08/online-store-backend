export const getHealth = (req, res) => {
  res.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
};
